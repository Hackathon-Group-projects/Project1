from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────
#  INPUT  —  Core Scanner Output Schema
#  (Aryan's Node.js backend sends this to POST /analyze)
# ─────────────────────────────────────────────────────────────

class DataContent(BaseModel):
    content: str                    # scanned text / URL / raw content
    mimeType: str                   # e.g. "text/plain", "text/html"
    fileType: str                   # e.g. "DOCUMENT", "URL", "HTML"


class ScanMetadata(BaseModel):
    device: Optional[str] = None        # e.g. "iPhone 14" or "Server"
    appVersion: Optional[str] = None
    userId: str                         # who triggered the scan
    processingTime: Optional[str] = None


class Entity(BaseModel):
    type: str                       # e.g. "CVE", "HEADER", "MEMBER", "TECH"
    value: str                      # e.g. "CVE-2024-3934", "content-security-policy"


class ScanResult(BaseModel):
    extractedText: str              # main findings / scan output as text
    confidence: Optional[float] = None   # 0.0 - 1.0
    language: Optional[str] = "en"
    entities: List[Entity] = []     # structured findings pulled from the scan


class ScanInput(BaseModel):
    """
    Core Scanner Output Schema — sent by Aryan (Node.js) to POST /analyze.
    Himanshu's scanners populate result.entities and result.extractedText.
    """
    id: str                          # e.g. "scan_78Hm0cef"
    timestamp: str                   # ISO 8601 datetime string
    source: str                      # e.g. "web_scanner", "mobile_app"
    type: str                        # "scan"
    data: DataContent
    metadata: ScanMetadata
    result: ScanResult
    status: str                      # "completed"
    nextStep: Optional[str] = None   # "store_in_db" | "send_to_gemini"


# ─────────────────────────────────────────────────────────────
#  OUTPUT  —  Final AI Report Schema
#  (Divyansh returns this → Aryan saves to MongoDB → Kashvi formats PDF → Kavyansh shows on dashboard)
# ─────────────────────────────────────────────────────────────

class Summary(BaseModel):
    totalIssues: int
    violations: int
    riskScore: int = Field(ge=0, le=100)    # 0-100


class Finding(BaseModel):
    type: str           # e.g. "data_leak", "missing_header", "cve", "ssl_issue"
    severity: str       # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    description: str    # plain English — what is this finding?
    evidence: List[str] = []    # specific values found, e.g. ["file1.txt", "CSP missing"]


class Recommendation(BaseModel):
    id: str             # e.g. "rec_1"
    title: str          # short title, e.g. "Enable encryption"
    description: str    # detailed fix instructions with code if needed


class RemediationOutput(BaseModel):
    """
    Final AI Report Schema — returned by Divyansh's /analyze endpoint.
    Aryan saves this to MongoDB aiReport field.
    Kashvi reads this to generate the PDF.
    Kavyansh displays this on the Security Dashboard.
    """
    id: str                         # e.g. "report_40h0gh"
    memberId: str                   # userId from the scan request
    timestamp: str                  # when the AI processed it (ISO 8601)
    summary: Summary
    findings: List[Finding]
    recommendations: List[Recommendation]
    generatedAt: str                # same as timestamp — when report was generated
    grade: str                      # "A" | "B" | "C" | "D" | "F"


# ─────────────────────────────────────────────────────────────
#  CHAT  —  Ask AI Sidebar
#  (Kavyansh's frontend calls POST /chat)
# ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    scan_url: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
