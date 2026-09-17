import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class GeminiService:
    """
    Wraps all Gemini API calls:
      - generate_remediation()  →  structured JSON report (for /analyze)
      - generate_chat()         →  plain text answer   (for /chat sidebar)
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set in .env")

        genai.configure(api_key=api_key)

        # Flash model for structured JSON remediation reports
        # response_mime_type forces Gemini to return valid JSON — no hallucinated prose
        self._flash = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2,        # low temp = precise, deterministic
                max_output_tokens=8192,
            ),
        )

        # Flash model for conversational chat answers (Ask AI sidebar)
        self._chat = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=2048,
            ),
        )

        logger.info("Gemini service initialized ✅")

    def generate_remediation(self, prompt: str) -> dict:
        """
        Call Gemini Flash with the security scan prompt.
        Returns a parsed dict matching the RemediationOutput schema.
        Raises ValueError if Gemini returns invalid JSON.
        """
        try:
            response = self._flash.generate_content(prompt)
            text = response.text.strip()

            # Strip accidental markdown code fences
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]

            parsed = json.loads(text.strip())
            logger.info(
                f"Gemini returned score={parsed.get('overallScore')} "
                f"risk={parsed.get('riskLevel')} "
                f"vulns={len(parsed.get('vulnerabilities', []))}"
            )
            return parsed

        except json.JSONDecodeError as exc:
            logger.error(f"Gemini returned invalid JSON: {exc}\nRaw: {text[:500]}")
            raise ValueError(f"Gemini returned invalid JSON: {exc}") from exc

        except Exception as exc:
            logger.error(f"Gemini API call failed: {exc}")
            raise

    def generate_chat(self, prompt: str) -> str:
        """
        Call Gemini for the Ask AI sidebar — returns plain text answer.
        """
        try:
            response = self._chat.generate_content(prompt)
            return response.text
        except Exception as exc:
            logger.error(f"Gemini chat failed: {exc}")
            raise
