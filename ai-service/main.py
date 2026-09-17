"""
FastAPI entry point — Web Security Audit AI Service

Endpoints:
  POST /analyze  — Full scan JSON in → Remediation JSON out
  POST /chat     — Ask AI sidebar RAG chat
  GET  /health   — Health check (used by Node.js backend to verify service is up)

Start server:
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import ScanInput, RemediationOutput, ChatRequest, ChatResponse
from services.rag_service import RAGService
from services.gemini_service import GeminiService
from services.prompt_builder import build_prompt

# ── Logging ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ai-service")

# ── Service singletons (initialised at startup) ─────────────
rag_service:    RAGService    = None  # type: ignore
gemini_service: GeminiService = None  # type: ignore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise heavy services once at startup, clean up on shutdown."""
    global rag_service, gemini_service

    logger.info("🚀  Starting AI Service...")
    rag_service    = RAGService()
    gemini_service = GeminiService()
    logger.info("✅  AI Service ready — listening for requests")

    yield  # server runs here

    logger.info("🛑  Shutting down AI Service")


# ── FastAPI App ────────────────────────────────────────────
app = FastAPI(
    title="Security Audit AI Service",
    description=(
        "RAG + Gemini 1.5 Flash powered security remediation engine.\n\n"
        "Receives raw scan JSON from Node.js backend (Aryan), "
        "enriches with OWASP context via ChromaDB (RAG), "
        "calls Gemini, returns structured remediation JSON for PDF formatting (Kashvi)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow Node.js backend to call this ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to backend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ───────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


# ══════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/health", tags=["Utility"])
def health():
    """
    Health check used by Node.js backend (Aryan) to confirm this service is up.
    Returns 200 if everything is initialised correctly.
    """
    rag_count = rag_service._collection.count() if rag_service else 0
    return {
        "status":          "ok",
        "service":         "ai-service",
        "chroma_chunks":   rag_count,
        "rag_ready":       rag_count > 0,
        "gemini_ready":    gemini_service is not None,
    }


@app.post("/analyze", response_model=RemediationOutput, tags=["Core"])
async def analyze(scan: ScanInput):
    """
    Main endpoint — called by Node.js backend after all 5 scanners complete.

    Flow:
      1. Extract RAG keywords from scan data
      2. Retrieve relevant OWASP documentation chunks (ChromaDB vector search)
      3. Build augmented prompt (scan summary + OWASP context + strict output schema)
      4. Call Gemini 1.5 Flash with response_mime_type=application/json
      5. Validate response with Pydantic RemediationOutput schema
      6. Return clean JSON

    Input:  ScanInput  (url, ssl, headers, tech, cves, nuclei)
    Output: RemediationOutput  (overallScore, riskLevel, vulnerabilities[], fixes[], priorityActionPlan[])
    """
    logger.info(f"📥  /analyze  →  {scan.url}")

    try:
        # ── Step 1: Extract keywords from scan for RAG query ──
        keywords = rag_service.extract_keywords(scan)
        logger.info(f"🔍  RAG keywords: {keywords[:120]}")

        # ── Step 2: Retrieve OWASP context from ChromaDB ──
        rag_context = rag_service.retrieve_context(keywords)
        if rag_context:
            logger.info(f"📚  RAG retrieved {len(rag_context):,} chars of security context")
        else:
            logger.warning("⚠️   RAG returned no context (ChromaDB may be empty)")

        # ── Step 3: Build the full prompt ──
        prompt = build_prompt(scan, rag_context=rag_context)

        # ── Step 4: Call Gemini Flash ──
        raw_output = gemini_service.generate_remediation(prompt)

        # ── Step 5: Validate with Pydantic + return ──
        result = RemediationOutput(**raw_output)
        logger.info(
            f"✅  /analyze done → score={result.overallScore}  "
            f"risk={result.riskLevel}  vulns={len(result.vulnerabilities)}"
        )
        return result

    except ValueError as exc:
        # Gemini returned invalid / incomplete JSON
        logger.error(f"❌  Validation error: {exc}")
        raise HTTPException(status_code=422, detail=str(exc))

    except Exception as exc:
        logger.error(f"❌  /analyze failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Ask AI sidebar endpoint — called by React frontend (Kavyansh) when user
    types a question like 'How do I fix CSP for WordPress?'.

    Flow:
      1. Use question as RAG query → retrieve relevant OWASP chunks
      2. Build chat prompt with context
      3. Call Gemini Flash (plain text mode)
      4. Return answer string

    Input:  ChatRequest  { question, scan_url? }
    Output: ChatResponse { answer }
    """
    logger.info(f"💬  /chat  →  '{request.question[:80]}'")

    try:
        # Retrieve OWASP context relevant to the question
        context = rag_service.retrieve_context(request.question, n_results=4)

        context_block = ""
        if context:
            context_block = f"""
## RELEVANT SECURITY DOCUMENTATION:
{context}

---
"""

        prompt = f"""You are a senior cybersecurity expert helping a developer fix a security issue.
Answer clearly and practically. Include exact, copy-paste code where relevant.
Be concise — 3-5 sentences max unless code is needed.

{context_block}
QUESTION: {request.question}
{f'(Context: Scan was for {request.scan_url})' if request.scan_url else ''}

Answer:"""

        answer = gemini_service.generate_chat(prompt)
        logger.info(f"✅  /chat responded ({len(answer)} chars)")
        return ChatResponse(answer=answer)

    except Exception as exc:
        logger.error(f"❌  /chat failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


# ── Dev runner ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
