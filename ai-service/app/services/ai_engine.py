import json
import os
from openai import OpenAI
from app.prompts import RESUME_ANALYSIS_PROMPT, INTERVIEW_PROMPT

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
print("OPENROUTER_API_KEY",OPENROUTER_API_KEY)
# if not OPENROUTER_API_KEY:
#     raise ValueError("OPENROUTER_API_KEY environment variable not set")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key='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',
)


def safe_json_parse(text):
    try:
        return json.loads(text)
    except:
        return {"error": "Invalid AI response", "raw": text}


def evaluate_resume_all(resume_text: str, job_description: str):
    
    # 🔹 Resume Analysis
    analysis_prompt = RESUME_ANALYSIS_PROMPT.format(
        resume=resume_text,
        job=job_description
    )
    # print(analysis_prompt)

    analysis_res = client.chat.completions.create(
        model="qwen/qwen3.6-plus:free",
        messages=[{"role": "user", "content": analysis_prompt}],
        temperature=0.3,
    )
    # print(analysis_res)

    analysis_data = safe_json_parse(
        analysis_res.choices[0].message.content
    )

    # 🔹 Interview Questions
    interview_prompt = INTERVIEW_PROMPT.format(
        resume=resume_text
    )

    interview_res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": interview_prompt}],
        temperature=0.5,
    )

    interview_data = safe_json_parse(
        interview_res.choices[0].message.content
    )

    return {
        "analysis": analysis_data,
        "interview": interview_data
    }