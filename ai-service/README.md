# 🧠 AI Service — Web Security Audit Platform

> **Owner**: Divyansh  
> **Stack**: Python · FastAPI · Gemini 1.5 Flash · ChromaDB · Pydantic  
> **Port**: `8000`

---

## What This Service Does

Receives raw security scan JSON from Node.js backend (Aryan) → enriches it with OWASP documentation via RAG → calls Gemini AI → returns a structured remediation report JSON for the PDF formatter (Kashvi).

```
[Aryan — Node.js]  →  POST /analyze  →  [Divyansh — ai-service]  →  RemediationOutput JSON  →  [Aryan saves to MongoDB]  →  [Kashvi formats PDF]
```

---

## 🚀 Setup — First Time

### 1. Create and activate virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your Gemini API key
Open `.env` and replace `your_gemini_api_key_here` with your actual key.  
Get a free key at: https://aistudio.google.com/app/apikey

### 4. Run the RAG ingestion (one-time only)
This reads all OWASP documents in `rag/documents/`, embeds them, and stores them in ChromaDB:
```bash
python rag/ingest.py
```
Expected output:
```
✅  Ingestion complete! 312 chunks stored in ChromaDB
🚀  You can now start the server: uvicorn main:app --reload
```

### 5. Start the server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📡 API Endpoints

### `POST /analyze` — Main scan analysis
**Called by**: Aryan (Node.js backend) after all 5 scanners complete

**Request body** (`ScanInput`):
```json
{
  "url": "https://example.com",
  "ssl": { "valid": true, "grade": "A", "daysRemaining": 42 },
  "headers": {
    "missing": ["content-security-policy", "strict-transport-security"],
    "present": ["x-frame-options"]
  },
  "tech": [{ "name": "WordPress", "version": "6.2" }],
  "cves": [{ "id": "CVE-2024-3934", "severity": "HIGH", "summary": "Stored XSS" }],
  "nuclei": [{ "name": "Exposed .env file", "severity": "CRITICAL" }]
}
```

**Response** (`RemediationOutput`):
```json
{
  "overallScore": 42,
  "riskLevel": "MEDIUM",
  "executiveSummary": "Your site has 2 critical issues...",
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "title": "Missing Content-Security-Policy",
      "category": "HEADERS",
      "severity": "CRITICAL",
      "description": "...",
      "impact": "...",
      "recommendation": "...",
      "fixes": [
        {
          "platform": "Nginx",
          "language": "nginx",
          "code": "add_header Content-Security-Policy ...",
          "instructions": "1. Open nginx.conf ..."
        }
      ],
      "references": ["https://owasp.org/..."]
    }
  ],
  "positives": ["X-Frame-Options present"],
  "priorityActionPlan": [
    { "priority": 1, "action": "Add CSP header", "estimatedTime": "30 mins" }
  ]
}
```

---

### `POST /chat` — Ask AI sidebar
**Called by**: React frontend (Kavyansh) from the Ask AI sidebar

**Request**:
```json
{ "question": "How do I fix CSP header for WordPress?", "scan_url": "https://example.com" }
```

**Response**:
```json
{ "answer": "To add a Content-Security-Policy header in WordPress, add this to your theme's functions.php..." }
```

---

### `GET /health` — Health check
**Called by**: Aryan (Node.js) on startup to verify AI service is up

**Response**:
```json
{
  "status": "ok",
  "service": "ai-service",
  "chroma_chunks": 312,
  "rag_ready": true,
  "gemini_ready": true
}
```

---

## 📁 Project Structure

```
ai-service/
├── main.py                         ← FastAPI app (entry point)
├── .env                            ← API keys (never commit this)
├── requirements.txt
│
├── models/
│   └── schemas.py                  ← ScanInput + RemediationOutput + ChatRequest/Response
│
├── services/
│   ├── rag_service.py              ← ChromaDB embed + vector search
│   ├── gemini_service.py           ← Gemini Flash API wrapper
│   └── prompt_builder.py           ← Prompt assembly with RAG context
│
└── rag/
    ├── ingest.py                   ← One-time document ingestion script
    ├── chroma_db/                  ← ChromaDB persistent storage (auto-created)
    └── documents/                  ← OWASP knowledge base documents
        ├── owasp_headers.txt
        ├── owasp_ssl.txt
        ├── owasp_top10.txt
        ├── nginx_security.txt
        ├── express_security.txt
        ├── wordpress_hardening.txt
        └── nuclei_misconfigs.txt
```

---

## 🔌 Integration Notes for Backend (Aryan)

Call this service from Node.js using fetch or axios:

```javascript
// aiService.js (Node.js)
const AI_SERVICE_URL = 'http://localhost:8000';

async function analyzeWithAI(scanData) {
  const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scanData),   // ScanInput shape
    signal: AbortSignal.timeout(60000) // 60s timeout
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`AI service error: ${err.detail}`);
  }

  return response.json(); // RemediationOutput shape
}
```

Health check on startup:
```javascript
async function checkAIService() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`);
    const data = await res.json();
    if (!data.rag_ready) console.warn('⚠️  AI service: RAG not ready (run python rag/ingest.py)');
    return data.status === 'ok';
  } catch {
    return false;
  }
}
```

---

## ⚠️ Important Notes

1. **Run `python rag/ingest.py` before starting the server** — the server starts but RAG won't work without it
2. **ChromaDB is local** — the `rag/chroma_db/` folder is created automatically, no external service needed
3. **MongoDB is optional** — Kashvi's MongoDB handles scan storage, this service only uses ChromaDB for vector search
4. **Gemini API key** — add to `.env`, never hardcode, never commit
