import os
import re
import json
import requests
from dotenv import load_dotenv
from typing import Any, Dict, List, Optional

from app.prompts import (
    generateNextStep_INTERVIEWER_PROMPT,
    generate_final_report_PROMPT,
    AI_SERVICE_ROLE,
)

load_dotenv()

BASE_URL = os.getenv(
    "OPENROUTER_BASE_URL",
    "https://openrouter.ai/api/v1/chat/completions"
)
API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")


# ================= NEXT STEP =================
def generate_next_step(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = requests.post(
            BASE_URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": AI_SERVICE_ROLE},
                    {
                        "role": "user",
                        "content": generateNextStep_INTERVIEWER_PROMPT.format(
    resume=data.get("resume", ""),
    jd=data.get("jd", ""),
    lastQuestion=data.get("lastQuestion", ""),
    userAnswer=data.get("userAnswer", ""),
    history=json.dumps(data.get("history", []), indent=2),
)
                    },
                ],
                "temperature": 0.7,
            },
            timeout=30,
        )

        response.raise_for_status()

        data_json = response.json()
        content = data_json.get("choices", [{}])[0].get("message", {}).get("content")

        if not isinstance(content, str):
            raise Exception("Invalid response format")

        return safe_json_parse(content)

    except Exception as error:
        print("Error generating next step:", get_error_details(error))

        return {
            "action": "next",
            "question": "Can you explain one of your recent projects and the technologies you usedbyeee ?",
            "evaluation": {
                "technicalScore": 5,
                "communicationScore": 5,
                "feedback": "Fallback response",
            },
        }


# ================= FINAL REPORT =================
def generate_final_report(
    history: List[Dict], resume: str, jd: str
) -> Dict[str, Any]:

    try:
        response = requests.post(
            BASE_URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a strict but fair technical interviewer.

Give honest feedback.
Avoid generic praise.
Be specific.
""",
                    },
                    {
                        "role": "user",
                        "content": generate_final_report_PROMPT.format(
                            history=history, resume=resume, jd=jd
                        ),
                    },
                ],
                "temperature": 0.6,
            },
            timeout=30,
        )

        response.raise_for_status()

        data_json = response.json()
        content = data_json.get("choices", [{}])[0].get("message", {}).get("content")

        if not isinstance(content, str):
            raise Exception("Invalid response format")

        return safe_final_report_parse(content)

    except Exception as error:
        print("Error generating final report:", get_error_details(error))

        return {
            "technicalScore": 5,
            "communicationScore": 5,
            "overallScore": 5,
            "strengths": ["Basic understanding of concepts"],
            "weaknesses": ["Needs improvement in explaining concepts clearly"],
            "suggestions": ["Practice mock interviews"],
        }


# ================= PARSERS =================
def safe_json_parse(text: str) -> Dict[str, Any]:
    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            parsed = json.loads(match.group())
            normalized = normalize_ai_response(parsed)
            if normalized:
                return normalized
        raise Exception("Invalid JSON")
    except:
        print("JSON parse failed, fallback:", text)
        return {"action": "next", "question": text, "evaluation": None}


def normalize_ai_response(value: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(value, dict):
        return None

    action = value.get("action")
    question = value.get("question")
    evaluation = value.get("evaluation")

    if not isinstance(action, str):
        return None

    if action == "ask":
        action = "next"

    if action not in ["next", "repeat", "explain", "end"]:
        return None

    if question is not None and not isinstance(question, str):
        return None

    if evaluation is not None and not is_ai_evaluation(evaluation):
        return None

    return {
        "action": action,
        "question": question,
        "evaluation": evaluation,
    }


def safe_final_report_parse(text: str) -> Dict[str, Any]:
    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            parsed = json.loads(match.group())
            if is_final_report(parsed):
                return parsed
        raise Exception("Invalid JSON")
    except:
        print("Final report parse failed:", text)
        return {
            "technicalScore": 5,
            "communicationScore": 5,
            "overallScore": 5,
            "strengths": ["Basic understanding"],
            "weaknesses": ["Needs improvement"],
            "suggestions": ["Practice more"],
        }


# ================= HELPERS =================
def is_ai_evaluation(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and isinstance(value.get("technicalScore"), (int, float))
        and isinstance(value.get("communicationScore"), (int, float))
        and isinstance(value.get("feedback"), str)
    )


def is_final_report(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and isinstance(value.get("technicalScore"), (int, float))
        and isinstance(value.get("communicationScore"), (int, float))
        and isinstance(value.get("overallScore"), (int, float))
        and is_string_array(value.get("strengths"))
        and is_string_array(value.get("weaknesses"))
        and is_string_array(value.get("suggestions"))
    )


def is_string_array(value: Any) -> bool:
    return isinstance(value, list) and all(isinstance(i, str) for i in value)


def get_error_details(error: Exception) -> str:
    return str(error)


# ================= INTENT =================
def detect_intent(answer: str) -> bool:
    text = answer.lower().strip()

    patterns = [
        r"\bend interview\b",
        r"\bstop interview\b",
        r"\bfinish interview\b",
        r"\bexit interview\b",
        r"\bi'?m done\b",
        r"\bi am done\b",
        r"\blet'?s end\b",
        r"\bwrap (this )?up\b",
        r"\bthat'?s all\b",
        r"\bno more questions\b",
    ]

    return any(re.search(p, text) for p in patterns)