# 🛡️ Secura — AI Web Security & Vulnerability Platform

> AI-augmented web security diagnostic and vulnerability remediation platform with built-in DevSecOps CI/CD pipeline.

## Overview

Secura scans websites for security vulnerabilities across 5 layers (SSL/TLS, HTTP headers, tech stack fingerprinting, CVE lookup, passive DAST) and generates AI-powered remediation reports using **Google Gemini + RAG** (OWASP docs via ChromaDB).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  Dashboard · Report Tabs · AI Chat Widget · PDF Export       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Node.js Express API                        │
│  Auth · Scan Orchestrator · SSE Progress · MongoDB           │
│  ┌─────────┬──────────┬───────────┬─────────┬──────────┐    │
│  │   SSL   │ Headers  │ TechStack │  CVE    │  Nuclei  │    │
│  │ Checker │ Inspector│ Fingerprint│ Lookup │   DAST   │    │
│  └────┬────┴────┬─────┴─────┬─────┴────┬────┴────┬─────┘    │
│       └─────────┴───────────┴──────────┴─────────┘          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                Python FastAPI AI Service                     │
│  ChromaDB RAG (OWASP Knowledge) + Google Gemini Flash        │
│  → Structured JSON Remediation Reports + AI Chat             │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              CI/CD Pipeline (SecAudit CLI)                    │
│  GitHub Action · Static Analysis · AI Fix Comments · PR Gate │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Hackathon-Group-projects/Project1.git
cd Project1
npm install
cd client && npm install && cd ..
cd ai-service && pip install -r requirements.txt && cd ..

# 2. Setup environment variables
cp server/.env.example server/.env
# Add: MONGO_URI, JWT_SECRET, GEMINI_API_KEY

# 3. Start services
npm run dev              # Node.js API server (port 4000)
cd ai-service && uvicorn main:app --reload  # Python AI service (port 8000)
cd client && npm run dev # React frontend (port 5173)
```

---

## 🛡️ CI/CD Pipeline Integration (DevSecOps)

SecAudit is the CLI security scanner that integrates Secura's vulnerability detection into your CI/CD pipeline. It scans code for security issues before deployment and uses **AI-generated fixes** to help developers resolve them instantly.

### What It Detects

| Rule ID | Vulnerability | Severity | CWE | OWASP |
|---------|--------------|----------|-----|-------|
| SEC-001 | Hardcoded Secrets / API Keys | 🔴 CRITICAL | CWE-798 | A07:2021 |
| SEC-002 | SQL Injection (String Concat) | 🔴 CRITICAL | CWE-89 | A03:2021 |
| SEC-003 | XSS — Unsafe DOM Manipulation | 🔴 CRITICAL | CWE-79 | A03:2021 |
| SEC-004 | Code Injection (eval/Function) | 🟠 HIGH | CWE-94 | A03:2021 |
| SEC-005 | Command Injection (child_process) | 🟠 HIGH | CWE-78 | A03:2021 |
| SEC-006 | Missing Security Headers (Helmet) | 🟠 HIGH | CWE-693 | A05:2021 |
| SEC-007 | Insecure Crypto (MD5/SHA1) | 🟠 HIGH | CWE-327 | A02:2021 |
| SEC-008 | Path Traversal | 🟡 MEDIUM | CWE-22 | A01:2021 |
| SEC-009 | Server-Side Request Forgery | 🟡 MEDIUM | CWE-918 | A10:2021 |
| SEC-010 | Sensitive Data in Logs | 🟡 MEDIUM | CWE-532 | A09:2021 |
| SEC-011 | Insecure Cookie Config | 🔵 LOW | CWE-614 | A07:2021 |
| SEC-012 | Hardcoded JWT Secret | 🟠 HIGH | CWE-321 | A02:2021 |
| SEC-013 | Open CORS (Wildcard Origin) | 🟡 MEDIUM | CWE-942 | A05:2021 |

### CLI Usage

```bash
# Install CLI dependencies
cd cli && npm install

# Scan current directory
node cli/secaudit.js scan

# Scan specific files
node cli/secaudit.js scan --files src/

# JSON output (for CI/CD)
node cli/secaudit.js scan --format json

# Only HIGH and CRITICAL issues
node cli/secaudit.js scan --severity HIGH

# List all rules
node cli/secaudit.js rules

# Run demo (scan deliberately vulnerable file)
node cli/secaudit.js scan --files cli/examples/vulnerable-demo.js
```

### Add to Your GitHub Repository

**Step 1:** Add `GEMINI_API_KEY` to your repo secrets:
> Settings → Secrets and Variables → Actions → New repository secret

**Step 2:** The workflow at `.github/workflows/security-scan.yml` automatically triggers on every PR to `main`/`develop`.

**What happens on a PR:**
1. ✅ GitHub Action triggers automatically
2. 🔍 SecAudit scans only the changed files
3. 🤖 If vulnerabilities found → Gemini AI generates fix suggestions
4. 💬 Fix suggestions posted as inline PR review comments
5. ⛔ PR blocked with `REQUEST_CHANGES` if CRITICAL/HIGH issues exist
6. ✅ PR approved if no issues found

### Use as a Reusable Action (Any Repo)

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Hackathon-Group-projects/Project1@main
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          scan-path: "src/"
          severity-threshold: "HIGH"
```

### How It Works

```
Developer pushes code → PR created
        ↓
GitHub Action triggers on PR
        ↓
SecAudit CLI scans changed files
        ↓
13 pattern-matching rules detect vulnerabilities
        ↓
┌──────────────────────────────────────┐
│  Vulnerabilities found?              │
├───── YES ────────────────────────────┤
│  1. Call Gemini AI for code fix      │
│  2. Post PR review with fix comment  │
│  3. Block PR (REQUEST_CHANGES)       │
│  4. Exit code 1 → CI fails          │
├───── NO ─────────────────────────────┤
│  1. Post ✅ approval comment         │
│  2. Exit code 0 → CI passes         │
└──────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3.4, React Router v7 |
| Backend | Node.js, Express 5, MongoDB (Mongoose 9), JWT Auth |
| AI Service | Python FastAPI, Google Gemini 3.5 Flash Lite, ChromaDB |
| Scanning | SSL Checker, Nuclei DAST, OSV.dev CVE API |
| CI/CD | GitHub Actions, SecAudit CLI, Gemini AI Fix Generator |

## Team

- **Aryan** — Backend API & Scan Orchestration
- **Kavyansh** — Frontend Dashboard & CI/CD Pipeline Integration
- **Divyansh** — AI Service (Gemini + RAG)
- **Kashvi** — PDF Report Generation
- **Himanshu** — Scanner Services

## License

MIT