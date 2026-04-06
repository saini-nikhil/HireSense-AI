RESUME_ANALYSIS_PROMPT = """
You are an expert ATS system.

Return ONLY JSON:

{{
  "matchScore": number,
  "matchedSkills": [string],
  "missingSkills": [string],
  "suggestions": [string],
  "summary": string
}}

RESUME:
{resume}

JOB DESCRIPTION:
{job}
"""

INTERVIEW_PROMPT = """
Generate 5 interview questions based on this resume.

Return ONLY JSON:
{{
  "questions": [string]
}}

RESUME:
{resume}
"""


EVALUATION_PROMPT = """
Evaluate the answer.

Return ONLY JSON:
{
  "score": number,
  "feedback": string
}

QUESTION:
{question}

ANSWER:
{answer}
"""