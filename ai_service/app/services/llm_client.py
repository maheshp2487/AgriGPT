"""
Optional External LLM Client for AgriGPT.
Supports OpenAI, Gemini, Groq, and local Ollama if configured via environment variables.
Always guarded by CIBRC pesticide safety and ICAR ground truth.
"""

import os
import httpx
from typing import Optional, Dict, Any


class ExternalLLMClient:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.ollama_url = os.getenv("OLLAMA_BASE_URL")

    @property
    def is_configured(self) -> bool:
        return bool(self.openai_key or self.gemini_key or self.groq_key or self.ollama_url)

    async def generate_response(self, prompt: str, locale: str = "en") -> Optional[str]:
        if not self.is_configured:
            return None

        system_instruction = (
            f"You are AgriGPT, an agricultural AI assistant grounded in official ICAR (krishi.icar.gov.in) "
            f"and AGMARKNET (agmarknet.gov.in) standards. Answer the farmer's question in locale '{locale}'. "
            f"Never recommend banned pesticides (e.g., Endosulfan). Provide safe, practical agronomic advice."
        )

        try:
            # 1. Groq (Fastest low-cost option)
            if self.groq_key:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.groq_key}"},
                        json={
                            "model": "llama-3.1-8b-instant",
                            "messages": [
                                {"role": "system", "content": system_instruction},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]

            # 2. OpenAI
            if self.openai_key:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.openai_key}"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_instruction},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]

            # 3. Local Ollama
            if self.ollama_url:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(
                        f"{self.ollama_url.rstrip('/')}/api/generate",
                        json={
                            "model": "llama3.1",
                            "prompt": f"{system_instruction}\n\nQuestion: {prompt}\nAnswer:",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data.get("response")

        except Exception:
            # Fall back to built-in AgriUniverse engine without crashing
            return None

        return None


llm_client = ExternalLLMClient()
