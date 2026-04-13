import json
import os
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError, RateLimitError

from app.prompts import (
    INTERVIEW_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    EVALUATION_PROMPT,
)

# 📁 Load env
BASE_DIR = Path(__file__).resolve().parents[2]
APP_DIR = Path(__file__).resolve().parents[1]

load_dotenv(BASE_DIR / ".env")
load_dotenv(APP_DIR / ".env")

# 🔐 Config
OPENROUTER_BASE_URL = os.getenv(
    "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
)

ANALYSIS_MODELS = tuple(
    model.strip()
    for model in os.getenv(
        "OPENROUTER_ANALYSIS_MODELS",
        "gpt-4o-mini",
    ).split(",")
    if model.strip()
)

INTERVIEW_MODELS = tuple(
    model.strip()
    for model in os.getenv(
        "OPENROUTER_INTERVIEW_MODELS",
        "gpt-4o-mini",
    ).split(",")
    if model.strip()
)

_client: OpenAI | None = None


class AIServiceError(RuntimeError):
    pass


# 🔗 Client
def _get_client() -> OpenAI:
    global _client

    if _client:
        return _client

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise AIServiceError("OPENROUTER_API_KEY not set")

    _client = OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=api_key,
    )
    return _client


# 🔥 Better JSON parsing (important)
def safe_json_parse(text: str):
    try:
        return json.loads(text)
    except:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            return json.loads(text[start:end])
        except:
            return {"error": "Invalid AI response", "raw": text}


# 🧠 Extract text
def _first_text_content(response) -> str:
    try:
        content = response.choices[0].message.content

        if isinstance(content, str):
            return content

        if isinstance(content, list):
            return "".join(
                part.text for part in content if getattr(part, "type", None) == "text"
            )

        return str(content)
    except Exception:
        return ""


# 🔁 LLM call with fallback
def _complete_with_fallback(prompt: str, models: Iterable[str], temperature: float):
    client = _get_client()
    last_error = None

    for model in models:
        try:
            return client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
            )

        except RateLimitError as e:
            last_error = e
            continue

        except OpenAIError as e:
            raise AIServiceError(f"{model} failed: {e}") from e

    raise AIServiceError("All models failed") from last_error


# 🚀 MAIN FUNCTION
def evaluate_resume_all(resume_text: str, job_description: str):

    # limit text (VERY IMPORTANT)
    resume_text = resume_text[:4000]
    job_description = job_description[:2000]

    # 🔹 Resume Analysis
    analysis_prompt = RESUME_ANALYSIS_PROMPT.format(
        resume=resume_text,
        job=job_description,
    )
    print(analysis_prompt)

    analysis_res = _complete_with_fallback(
        prompt=analysis_prompt,
        models=ANALYSIS_MODELS,
        temperature=0.3,
    )

    analysis_data = safe_json_parse(_first_text_content(analysis_res))

    # 🔹 Interview Questions
    interview_prompt = INTERVIEW_PROMPT.format(resume=resume_text)

    interview_res = _complete_with_fallback(
        prompt=interview_prompt,
        models=INTERVIEW_MODELS,
        temperature=0.5,
    )

    interview_data = safe_json_parse(_first_text_content(interview_res))

    return {
        "analysis": analysis_data,
        "interview": interview_data,
    }


# 🎤 ANSWER EVALUATION (FIXED)
def evaluate_answer(question: str, answer: str):

    prompt = EVALUATION_PROMPT.format(
        question=question,
        answer=answer,
    )

    res = _complete_with_fallback(
        prompt=prompt,
        models=INTERVIEW_MODELS,
        temperature=0.3,
    )

    return safe_json_parse(_first_text_content(res))


# def analyze_skill_gap(self, structured_resume: dict, jd: str) -> dict:
#     prompt = f"""
# You are a hiring expert.
def generate_ats_resume_structured(resume_text: str, job_description: str, suggestions=None):
    suggestions = suggestions or []

    prompt = f"""
You are an ATS Resume Builder.

=========================
INPUT
=========================

Resume:
{resume_text}

Job Description:
{job_description}

Suggestions:
{suggestions}

=========================
TASK
=========================

Create an ATS-optimized resume.

=========================
OUTPUT (STRICT JSON)
=========================

{{
  "name": "",
  "title": "",
  "summary": "",
  "skills": [],
  "experience": [
    {{
      "company": "",
      "role": "",
      "points": []
    }}
  ],
  "projects": [],
  "education": []
}}
"""

    res = _complete_with_fallback(
        prompt=prompt,
        models=ANALYSIS_MODELS,
        temperature=0.3,
    )

    return safe_json_parse(_first_text_content(res))

def analyze_skill_gap(self, structured_resume: dict, jd: str) -> dict:
    prompt = f"""
You are a hiring expert.

# Candidate Skills:
# {structured_resume.get("skills", [])}

# Job Description:
# {jd}

# =========================
# TASK:
# =========================

# 1. Identify:
#    - matched skills
#    - missing skills
#    - extra skills

# 2. Evaluate readiness

# =========================
# OUTPUT (STRICT JSON)
# =========================

# {{
#   "matchedSkills": [],
#   "missingSkills": [],
#   "extraSkills": [],
#   "readiness": "low | medium | high"
# }}
# """

#     try:
#         response = requests.post(
#             self.base_url,
#             headers={
#                 "Authorization": f"Bearer {self.api_key}",
#                 "Content-Type": "application/json",
#             },
#             json={
#                 "model": "openai/gpt-4o-mini",
#                 "messages": [
#                     {"role": "system", "content": "You analyze hiring fit."},
#                     {"role": "user", "content": prompt},
#                 ],
#                 "temperature": 0.3,
#             },
#         )

#         content = response.json()["choices"][0]["message"]["content"]
#         return self.safe_json_parse(content)

#     except:
#         return {
#             "matchedSkills": [],
#             "missingSkills": [],
#             "extraSkills": [],
#             "readiness": "medium"
#         }
    


# # def generateFinalReport(history: any[], resume:, jd):
        