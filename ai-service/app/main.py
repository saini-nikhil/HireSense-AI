from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.services.ai_engine import AIServiceError, evaluate_resume_all,evaluate_answer,generate_ats_resume_structured
from app.utils.parser import extract_text_from_pdf

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def hello():
    return {'message': 'Hello World'}


@app.post('/evaluate')
async def evaluate_resume(
    file: UploadFile = File(...),
    jobDescription: str = Form(...),
):
    print(file)
    print(jobDescription)
    try:
        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        # print(resume_text)
        return evaluate_resume_all(resume_text, jobDescription)
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail='Failed to evaluate resume' ,) from exc
    




# @app.post('/test')
# async def test(answer , question):
#     return evaluate_answer(question, answer)
#     # return {'answer': answer, 'question': question}
@app.post('/improve-resume-pdf')
async def improve_resume_pdf(
    file: UploadFile = File(...),
    jobDescription: str = Form(...),
    suggestions: str = Form(...),
):
    try:
        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        return generate_ats_resume_structured(resume_text, jobDescription, suggestions)
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail='Failed to improve resume') from exc               

@app.post('/test')
async def test(answer , question):
    return evaluate_answer(question, answer)
    # return {'answer': answer, 'question': question}
