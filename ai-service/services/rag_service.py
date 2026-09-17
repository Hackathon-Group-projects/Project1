import os
import logging
from typing import Optional
import google.generativeai as genai
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings
from dotenv import load_dotenv

from models.schemas import ScanInput

load_dotenv()
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
#  Custom Gemini Embedding Function for ChromaDB
# ──────────────────────────────────────────────

class GeminiEmbeddingFunction(EmbeddingFunction):
    """
    Wraps Gemini text-embedding-004 as a ChromaDB EmbeddingFunction.
    task_type changes between document ingestion and query time.
    """
    def __init__(self, task_type: str = "retrieval_document"):
        self.task_type = task_type

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for text in input:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type=self.task_type
            )
            embeddings.append(result["embedding"])
        return embeddings


# ──────────────────────────────────────────────
#  RAG Service
# ──────────────────────────────────────────────

class RAGService:
    """
    Handles all RAG operations:
      1. Keyword extraction from ScanInput
      2. Query embedding (Gemini text-embedding-004)
      3. ChromaDB vector similarity search
      4. Context string assembly for prompt
    """

    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        db_path = os.getenv("CHROMA_DB_PATH", "./rag/chroma_db")

        # Separate embedding functions for documents vs queries
        self._doc_embed_fn   = GeminiEmbeddingFunction(task_type="retrieval_document")
        self._query_embed_fn = GeminiEmbeddingFunction(task_type="retrieval_query")

        self._client = chromadb.PersistentClient(path=db_path)

        # Collection uses the document embedding function by default
        self._collection = self._client.get_or_create_collection(
            name="security_knowledge",
            embedding_function=self._doc_embed_fn,
            metadata={"hnsw:space": "cosine"}
        )

        count = self._collection.count()
        if count == 0:
            logger.warning(
                "⚠️  ChromaDB is empty! Run:  python rag/ingest.py  before starting the server."
            )
        else:
            logger.info(f"ChromaDB ready — {count} knowledge chunks loaded ✅")

    # ── Public Methods ──────────────────────────────────────

    def extract_keywords(self, scan: ScanInput) -> str:
        """
        Pull the most useful search terms from the scan result.
        Uses new ScanInput schema — extracts from entities + extractedText.
        """
        parts: list[str] = []

        # Entities are most precise (CVE IDs, header names, tech names)
        if scan.result.entities:
            for entity in scan.result.entities:
                parts.append(entity.value)
                parts.append(entity.type)

        # Pull keywords from the extractedText (first 500 chars)
        if scan.result.extractedText:
            parts.append(scan.result.extractedText[:500])

        # Target content (URL or document name)
        if scan.data.content:
            parts.append(scan.data.content[:200])

        return " ".join(filter(None, parts))

    def retrieve_context(self, query: str, n_results: int = 5) -> str:
        """
        Embed query → similarity search → return top chunks as one string.
        Returns empty string if ChromaDB is empty (graceful degradation).
        """
        if not query.strip() or self._collection.count() == 0:
            return ""

        try:
            # Embed the query with retrieval_query task type
            query_embedding = self._query_embed_fn([query])[0]

            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, self._collection.count()),
                include=["documents", "metadatas"]
            )

            chunks    = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas",  [[]])[0]

            context_parts = []
            for chunk, meta in zip(chunks, metadatas):
                source = meta.get("source", "Security Documentation")
                context_parts.append(f"[Source: {source}]\n{chunk}")

            return "\n\n---\n\n".join(context_parts)

        except Exception as exc:
            logger.error(f"RAG retrieval failed: {exc}")
            return ""   # graceful degradation — still call Gemini without context
