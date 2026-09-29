import sys
sys.path.append('ai-service')
from services.gemini_service import GeminiService

prompt = """You are a senior cybersecurity analyst. Analyze the security scan results below.
Return ONLY the following JSON.

{
  "recommendations": [
    {
      "id": "rec_1",
      "title": "<short action title>",
      "description": "<detailed fix. You MUST provide the exact copy-paste code or configuration fix inside a markdown code block (```). Include this code block for EVERY recommendation without exception.>"
    }
  ]
}
"""

try:
    svc = GeminiService()
    res = svc.generate_remediation(prompt)
    print("SUCCESS")
    print(res)
except Exception as e:
    print(f"ERROR: {e}")
