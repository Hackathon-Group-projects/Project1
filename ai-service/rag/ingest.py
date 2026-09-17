"""
One-time RAG knowledge base ingestion script.

Run this BEFORE starting the FastAPI server:
    python rag/ingest.py

What it does:
  1. Reads all .txt / .md files from rag/documents/
  2. Splits each file into overlapping text chunks (~1500 chars)
  3. Embeds each chunk using Gemini text-embedding-004
  4. Stores chunks + embeddings in ChromaDB (persisted to disk)

After running, ChromaDB has ~200-400 searchable security knowledge chunks
ready for the RAG retrieval at scan time.
"""
import os
import sys
import logging
from pathlib import Path

# Allow imports from project root
sys.path.insert(0, str(Path(__file__).parent.parent))

import google.generativeai as genai
import chromadb
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)


# ── Config ──────────────────────────────────────────────────
CHUNK_SIZE  = 1500   # characters per chunk
CHUNK_OVERLAP = 200  # overlap to preserve context at chunk boundaries
BATCH_SIZE  = 20     # how many chunks to embed in one loop iteration
# ────────────────────────────────────────────────────────────


def chunk_text(text: str) -> list[str]:
    """
    Split text into overlapping character-based chunks.
    Tries to break at sentence boundaries to keep chunks coherent.
    """
    chunks = []
    start  = 0
    text   = text.strip()

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))

        # Try to break at a sentence end (period + space)
        if end < len(text):
            last_period = text.rfind(". ", start + CHUNK_SIZE // 2, end)
            if last_period != -1:
                end = last_period + 2  # include the period

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # ── CRITICAL FIX: stop when we've reached the end ──
        if end >= len(text):
            break

        next_start = end - CHUNK_OVERLAP
        # Safety: always make forward progress (prevents infinite loop)
        if next_start <= start:
            next_start = start + 1
        start = next_start

    return chunks



def embed_texts(texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
    """Embed a list of text strings using Gemini text-embedding-004."""
    import time
    embeddings = []
    total = len(texts)
    for i, text in enumerate(texts, 1):
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type=task_type
            )
            embeddings.append(result["embedding"])
        except Exception as exc:
            logger.warning(f"    Embed retry on chunk {i} after error: {exc}")
            time.sleep(3)
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type=task_type
            )
            embeddings.append(result["embedding"])

        # Progress bar every 5 chunks
        if i % 5 == 0 or i == total:
            bar = "█" * (i * 20 // total) + "░" * (20 - i * 20 // total)
            logger.info(f"    [{bar}] {i}/{total} chunks embedded")

        # Small delay to respect Gemini free-tier rate limits (60 req/min)
        time.sleep(0.3)

    return embeddings



def get_category(filename: str) -> str:
    """Infer RAG category from document filename."""
    name = filename.lower()
    if any(k in name for k in ["header", "csp", "hsts", "cors", "xss"]):
        return "headers"
    if any(k in name for k in ["ssl", "tls", "cert", "https"]):
        return "ssl"
    if any(k in name for k in ["cve", "vulnerab", "exploit"]):
        return "cve"
    if any(k in name for k in ["nuclei", "misconfig", "exposure", "env", "git"]):
        return "nuclei"
    if any(k in name for k in ["wordpress", "wp", "nginx", "apache", "express", "node"]):
        return "tech"
    return "general"


def ingest_documents():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.error("❌  GEMINI_API_KEY not set in .env — please add your key first!")
        sys.exit(1)

    genai.configure(api_key=api_key)

    db_path   = os.getenv("CHROMA_DB_PATH", "./rag/chroma_db")
    docs_dir  = Path(__file__).parent / "documents"

    if not docs_dir.exists():
        logger.error(f"❌  Documents folder not found: {docs_dir}")
        sys.exit(1)

    doc_files = sorted(list(docs_dir.glob("*.txt")) + list(docs_dir.glob("*.md")))
    if not doc_files:
        logger.error(f"❌  No .txt or .md files found in {docs_dir}")
        sys.exit(1)

    logger.info(f"📂  Found {len(doc_files)} documents in {docs_dir}")

    # ── ChromaDB setup ──
    client = chromadb.PersistentClient(path=db_path)

    # Always start fresh for ingestion
    try:
        client.delete_collection("security_knowledge")
        logger.info("🗑️   Cleared old ChromaDB collection")
    except Exception:
        pass

    collection = client.create_collection(
        name="security_knowledge",
        metadata={"hnsw:space": "cosine"}
    )

    # ── Process each document ──
    all_ids       = []
    all_documents = []
    all_metadatas = []
    all_embeddings = []

    for doc_file in doc_files:
        logger.info(f"\n📄  Processing: {doc_file.name}")
        text     = doc_file.read_text(encoding="utf-8")
        category = get_category(doc_file.name)
        chunks   = chunk_text(text)
        logger.info(f"    → {len(chunks)} chunks  (category: {category})")

        # Embed in small batches to avoid rate limits
        for batch_start in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[batch_start : batch_start + BATCH_SIZE]
            embeddings = embed_texts(batch)

            for i, (chunk, embedding) in enumerate(zip(batch, embeddings)):
                global_idx = batch_start + i
                all_ids.append(f"{doc_file.stem}_{global_idx}")
                all_documents.append(chunk)
                all_metadatas.append({
                    "source":      doc_file.name,
                    "category":    category,
                    "chunk_index": global_idx,
                })
                all_embeddings.append(embedding)

    # ── Store in ChromaDB ──
    logger.info(f"\n💾  Storing {len(all_documents)} chunks in ChromaDB...")

    STORE_BATCH = 100
    for i in range(0, len(all_documents), STORE_BATCH):
        end = min(i + STORE_BATCH, len(all_documents))
        collection.add(
            ids        = all_ids[i:end],
            documents  = all_documents[i:end],
            embeddings = all_embeddings[i:end],
            metadatas  = all_metadatas[i:end],
        )

    final_count = collection.count()
    logger.info(f"\n✅  Ingestion complete! {final_count} chunks stored in ChromaDB at: {db_path}")
    logger.info("🚀  You can now start the server: uvicorn main:app --reload")


if __name__ == "__main__":
    ingest_documents()
