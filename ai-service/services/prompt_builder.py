"""
Builds the full Gemini prompt from ScanInput + RAG context.

The prompt tells Gemini:
  1. What role to play (senior security analyst)
  2. What the scan found (extractedText + entities from ScanInput)
  3. What OWASP documentation says (rag_context from ChromaDB)
  4. Exactly what JSON schema to return (RemediationOutput)
"""

from __future__ import annotations
import json
from datetime import datetime, timezone
from models.schemas import ScanInput


def build_prompt(scan_data: ScanInput, rag_context: str = "") -> str:
    """
    Assemble the complete prompt string to send to Gemini Flash.

    Args:
        scan_data:   Validated ScanInput from the POST /analyze request
        rag_context: Top-5 relevant OWASP doc chunks retrieved from ChromaDB

    Returns:
        Full prompt string — ready to pass to Gemini
    """

    # ── Format scan findings for the prompt ──────────────────
    scan_summary = _format_scan_summary(scan_data)

    # ── RAG context block (empty string if ChromaDB had no results) ──
    rag_block = ""
    if rag_context and rag_context.strip():
        rag_block = f"""
## RELEVANT SECURITY DOCUMENTATION (use this to write better fixes):
{rag_context}

---
"""

    # ── Generate IDs for the output ──
    now_iso = datetime.now(timezone.utc).isoformat()
    report_id = f"report_{scan_data.id.replace('scan_', '')}"
    grade_note = "Pick the grade based on riskScore: 90-100=A, 75-89=B, 50-74=C, 25-49=D, 0-24=F"

    # ── Full prompt ───────────────────────────────────────────
    prompt = f"""You are a senior cybersecurity analyst. Analyze the security scan results below and produce a detailed remediation report.

## SCAN INFORMATION:
- Scan ID: {scan_data.id}
- Target: {scan_data.data.content}
- Scanned At: {scan_data.timestamp}
- User ID: {scan_data.metadata.userId}

## SCAN FINDINGS:
{scan_summary}

{rag_block}

## YOUR TASK:
Based on the scan findings and documentation above, produce a security remediation report.

## STRICT OUTPUT FORMAT:
Return ONLY the following JSON. No markdown, no extra text, no explanation — ONLY the raw JSON object.

{{
  "id": "{report_id}",
  "memberId": "{scan_data.metadata.userId}",
  "timestamp": "{now_iso}",
  "summary": {{
    "totalIssues": <integer — total count of all findings>,
    "violations": <integer — count of CRITICAL + HIGH severity findings>,
    "riskScore": <integer 0-100 — 0 is worst, 100 is perfect>
  }},
  "findings": [
    {{
      "type": "<string — category: 'missing_header' | 'ssl_issue' | 'cve' | 'exposed_file' | 'misconfiguration' | 'outdated_software' | 'data_leak'>",
      "severity": "<CRITICAL | HIGH | MEDIUM | LOW>",
      "description": "<clear plain English explanation of the issue and why it matters>",
      "evidence": ["<specific value found>", "<another value>"]
    }}
  ],
  "recommendations": [
    {{
      "id": "rec_1",
      "title": "<short action title>",
      "description": "<detailed fix with exact copy-paste code in the correct language — Nginx, Express.js, WordPress PHP, Apache, or bash>"
    }}
  ],
  "corrections": [
    {{
      "filePath": "<relative path to the file that needs correction, e.g. 'src/path/to/vulnerable/file.js'>",
      "replacementCode": "<exact updated/fixed code for this file>"
    }}
  ],
  "generatedAt": "{now_iso}",
  "grade": "<single letter A/B/C/D/F — {grade_note}>"
}}

## SCORING RULES:
- Start at 100
- Each CRITICAL finding: -25 points
- Each HIGH finding: -15 points  
- Each MEDIUM finding: -8 points
- Each LOW finding: -3 points
- Minimum score: 0

## IMPORTANT:
- Every finding MUST have a matching recommendation
- Include exact, working code in recommendations (not pseudocode)
- Use OWASP documentation context if provided above
- Be specific — mention the actual header names, CVE IDs, file names found
"""

    return prompt


def _format_scan_summary(scan: ScanInput) -> str:
    """Format ScanInput into readable text for the Gemini prompt."""
    lines = []

    # Main extracted findings text
    if scan.result.extractedText:
        lines.append(f"Extracted Findings:\n{scan.result.extractedText}")

    # Structured entities (CVEs, missing headers, etc.)
    if scan.result.entities:
        lines.append("\nStructured Entities Found:")
        for entity in scan.result.entities:
            lines.append(f"  - [{entity.type}] {entity.value}")

    # Confidence score
    if scan.result.confidence is not None:
        lines.append(f"\nScan Confidence: {scan.result.confidence * 100:.0f}%")

    # File/content type info
    lines.append(f"\nContent Type: {scan.data.fileType} ({scan.data.mimeType})")

    if not lines:
        lines.append("No specific findings captured in this scan.")

    return "\n".join(lines)
