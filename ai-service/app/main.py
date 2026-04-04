from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from app.utils.parser import extract_text_from_pdf
from app.services.ai_engine import evaluate_resume_all
# from utils.parser import extract_text_from_pdf
# from test_langgraph import run_agent
# from test import run_agent2 , AGENT_PROMPT
# from pydantic import BaseModel

app = FastAPI()



@app.get("/")
def hello():
    return {"message": "Hello World 🚀"}

@app.post("/evaluate")
async def evaluate_resume(
    file: UploadFile = File(...),
    jobDescription: str = Form(...)
):
    file_bytes = await file.read()

    resume_text = extract_text_from_pdf(file_bytes)
    # print(resume_text)
    # return resume_text , jobDescription


    result = evaluate_resume_all(resume_text, jobDescription)

    return result