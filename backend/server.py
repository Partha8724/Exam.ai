from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, UploadFile, File, Response, Cookie, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Emergent keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "exam-prep-hub"
storage_key = None

# Initialize storage
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        raise

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Auth helper
async def get_current_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)) -> dict:
    token = None
    if session_token:
        token = session_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    created_at: str

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str
    exam_type: str
    subject: str
    difficulty: str
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str
    created_at: str

class MockTest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    test_id: str
    user_id: str
    exam_type: str
    subject: str
    questions: List[str]
    answers: Optional[Dict[str, str]] = None
    score: Optional[float] = None
    completed_at: Optional[str] = None
    created_at: str

class StudyMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    material_id: str
    user_id: str
    title: str
    storage_path: str
    original_filename: str
    exam_type: str
    subject: str
    content_type: str
    size: int
    is_deleted: bool = False
    uploaded_at: str

class StudentProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    exam_type: str
    subject: str
    total_tests: int = 0
    average_score: float = 0.0
    weak_topics: List[str] = []
    strong_topics: List[str] = []
    last_updated: str

class GenerateQuestionsRequest(BaseModel):
    exam_type: str
    subject: str
    count: int = 10

class CreateTestRequest(BaseModel):
    exam_type: str
    subject: str
    question_count: int = 10

class SubmitTestRequest(BaseModel):
    answers: Dict[str, str]

# Auth Routes
@api_router.post("/auth/session")
async def exchange_session(session_id: str):
    try:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": data["name"], "picture": data["picture"]}}
            )
        else:
            user_doc = {
                "user_id": user_id,
                "email": data["email"],
                "name": data["name"],
                "picture": data["picture"],
                "role": "student",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        
        response = JSONResponse(content={"user": user})
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7*24*60*60
        )
        return response
    except Exception as e:
        logger.error(f"Session exchange failed: {e}")
        raise HTTPException(status_code=400, detail="Session exchange failed")

@api_router.get("/auth/me", response_model=User)
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return response

# Questions Routes
@api_router.get("/questions", response_model=List[Question])
async def get_questions(exam_type: Optional[str] = None, subject: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if exam_type:
        query["exam_type"] = exam_type
    if subject:
        query["subject"] = subject
    
    questions = await db.questions.find(query, {"_id": 0}).to_list(50)
    return questions

@api_router.post("/questions/generate")
async def generate_questions(body: GenerateQuestionsRequest, user: dict = Depends(get_current_user)):
    exam_type = body.exam_type
    subject = body.subject
    count = body.count
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"qgen_{uuid.uuid4().hex[:8]}",
            system_message=f"You are an expert in {exam_type} exam preparation. Generate high-quality multiple choice questions for {subject}."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(
            text=f"Generate {count} multiple choice questions for {exam_type} exam on the subject '{subject}'. For each question provide: question text, 4 options (A, B, C, D), correct answer, and a detailed explanation. Format as JSON array with fields: question_text, options (array), correct_answer, explanation, difficulty (easy/medium/hard)."
        )
        
        response = await chat.send_message(user_message)
        
        import json
        import re
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            questions_data = json.loads(json_match.group())
        else:
            questions_data = json.loads(response)
        
        saved_questions = []
        for q_data in questions_data[:count]:
            question_id = f"q_{uuid.uuid4().hex[:12]}"
            question_doc = {
                "question_id": question_id,
                "exam_type": exam_type,
                "subject": subject,
                "difficulty": q_data.get("difficulty", "medium"),
                "question_text": q_data["question_text"],
                "options": q_data["options"],
                "correct_answer": q_data["correct_answer"],
                "explanation": q_data["explanation"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.questions.insert_one(question_doc)
            question_doc.pop("_id", None)
            saved_questions.append(question_doc)
        
        return {"questions": saved_questions, "count": len(saved_questions)}
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

# Mock Tests Routes
@api_router.post("/tests/create")
async def create_test(body: CreateTestRequest, user: dict = Depends(get_current_user)):
    exam_type = body.exam_type
    subject = body.subject
    question_count = body.question_count
    
    questions = await db.questions.find(
        {"exam_type": exam_type, "subject": subject},
        {"_id": 0}
    ).to_list(question_count)
    
    if len(questions) < question_count:
        raise HTTPException(status_code=400, detail=f"Not enough questions available. Found {len(questions)}, need {question_count}")
    
    test_id = f"test_{uuid.uuid4().hex[:12]}"
    test_doc = {
        "test_id": test_id,
        "user_id": user["user_id"],
        "exam_type": exam_type,
        "subject": subject,
        "questions": [q["question_id"] for q in questions],
        "answers": None,
        "score": None,
        "completed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.mock_tests.insert_one(test_doc)
    test_doc.pop("_id", None)
    
    return {"test": test_doc, "questions": questions}

@api_router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, body: SubmitTestRequest, user: dict = Depends(get_current_user)):
    answers = body.answers
    
    test_doc = await db.mock_tests.find_one({"test_id": test_id, "user_id": user["user_id"]}, {"_id": 0})
    if not test_doc:
        raise HTTPException(status_code=404, detail="Test not found")
    
    questions = await db.questions.find(
        {"question_id": {"$in": test_doc["questions"]}},
        {"_id": 0}
    ).to_list(100)
    
    correct_count = 0
    for question in questions:
        if answers.get(question["question_id"]) == question["correct_answer"]:
            correct_count += 1
    
    score = (correct_count / len(questions)) * 100 if questions else 0
    
    await db.mock_tests.update_one(
        {"test_id": test_id},
        {"$set": {
            "answers": answers,
            "score": score,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await update_student_progress(user["user_id"], test_doc["exam_type"], test_doc["subject"], score)
    
    return {"score": score, "correct": correct_count, "total": len(questions), "questions": questions}

@api_router.get("/tests/{test_id}")
async def get_test(test_id: str, user: dict = Depends(get_current_user)):
    
    test_doc = await db.mock_tests.find_one({"test_id": test_id, "user_id": user["user_id"]}, {"_id": 0})
    if not test_doc:
        raise HTTPException(status_code=404, detail="Test not found")
    
    questions = await db.questions.find(
        {"question_id": {"$in": test_doc["questions"]}},
        {"_id": 0}
    ).to_list(100)
    
    return {"test": test_doc, "questions": questions}

@api_router.get("/tests")
async def get_user_tests(user: dict = Depends(get_current_user)):
    
    tests = await db.mock_tests.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return tests

# Student Progress
async def update_student_progress(user_id: str, exam_type: str, subject: str, score: float):
    progress_doc = await db.student_progress.find_one(
        {"user_id": user_id, "exam_type": exam_type, "subject": subject},
        {"_id": 0}
    )
    
    if progress_doc:
        total_tests = progress_doc["total_tests"] + 1
        avg_score = ((progress_doc["average_score"] * progress_doc["total_tests"]) + score) / total_tests
        
        weak_topics = progress_doc.get("weak_topics", [])
        strong_topics = progress_doc.get("strong_topics", [])
        
        if score < 50:
            if subject not in weak_topics:
                weak_topics.append(subject)
        elif score >= 70:
            if subject not in strong_topics:
                strong_topics.append(subject)
            if subject in weak_topics:
                weak_topics.remove(subject)
        
        await db.student_progress.update_one(
            {"user_id": user_id, "exam_type": exam_type, "subject": subject},
            {"$set": {
                "total_tests": total_tests,
                "average_score": avg_score,
                "weak_topics": weak_topics,
                "strong_topics": strong_topics,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        progress_doc = {
            "user_id": user_id,
            "exam_type": exam_type,
            "subject": subject,
            "total_tests": 1,
            "average_score": score,
            "weak_topics": [subject] if score < 50 else [],
            "strong_topics": [subject] if score >= 70 else [],
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        await db.student_progress.insert_one(progress_doc)

@api_router.get("/analysis/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    
    progress_docs = await db.student_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return progress_docs

@api_router.get("/analysis/recommendations")
async def get_recommendations(user: dict = Depends(get_current_user)):
    
    progress_docs = await db.student_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    
    all_weak_topics = []
    for progress in progress_docs:
        all_weak_topics.extend(progress.get("weak_topics", []))
    
    if not all_weak_topics:
        return {"recommendations": ["Great job! Keep practicing all subjects to maintain your performance."]}
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"rec_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert exam preparation coach. Provide concise, actionable study recommendations."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(
            text=f"Based on student's weak topics: {', '.join(set(all_weak_topics))}, provide 5 specific study recommendations to improve. Keep each recommendation under 20 words."
        )
        
        response = await chat.send_message(user_message)
        recommendations = [line.strip() for line in response.split('\n') if line.strip() and not line.strip().startswith('#')]
        
        return {"recommendations": recommendations[:5], "weak_topics": list(set(all_weak_topics))}
    except Exception as e:
        logger.error(f"Recommendations generation failed: {e}")
        return {"recommendations": [f"Focus on improving: {', '.join(set(all_weak_topics))}"], "weak_topics": list(set(all_weak_topics))}

# Study Materials Routes
@api_router.post("/materials/upload")
async def upload_material(
    file: UploadFile = File(...),
    exam_type: str = Query(...),
    subject: str = Query(...),
    title: str = Query(...),
    user: dict = Depends(get_current_user)
):
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/materials/{user['user_id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type or "application/octet-stream")
    
    material_id = f"mat_{uuid.uuid4().hex[:12]}"
    material_doc = {
        "material_id": material_id,
        "user_id": user["user_id"],
        "title": title,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "exam_type": exam_type,
        "subject": subject,
        "content_type": file.content_type or "application/octet-stream",
        "size": result["size"],
        "is_deleted": False,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.study_materials.insert_one(material_doc)
    material_doc.pop("_id", None)
    
    return material_doc

@api_router.get("/materials")
async def get_materials(exam_type: Optional[str] = None, subject: Optional[str] = None, user: dict = Depends(get_current_user)):
    
    query = {"user_id": user["user_id"], "is_deleted": False}
    if exam_type:
        query["exam_type"] = exam_type
    if subject:
        query["subject"] = subject
    
    materials = await db.study_materials.find(query, {"_id": 0}).to_list(100)
    return materials

@api_router.get("/materials/{material_id}/download")
async def download_material(material_id: str, authorization: Optional[str] = Header(None), auth: Optional[str] = Query(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    elif auth:
        token = auth
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    material = await db.study_materials.find_one(
        {"material_id": material_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    data, content_type = get_object(material["storage_path"])
    return Response(content=data, media_type=material.get("content_type", content_type))

@api_router.delete("/materials/{material_id}")
async def delete_material(material_id: str, user: dict = Depends(get_current_user)):
    
    result = await db.study_materials.update_one(
        {"material_id": material_id, "user_id": user["user_id"]},
        {"$set": {"is_deleted": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    
    return {"message": "Material deleted"}

# Dashboard stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    
    total_tests = await db.mock_tests.count_documents({"user_id": user["user_id"], "completed_at": {"$ne": None}})
    
    completed_tests = await db.mock_tests.find(
        {"user_id": user["user_id"], "completed_at": {"$ne": None}},
        {"_id": 0, "score": 1}
    ).to_list(1000)
    
    avg_score = sum(t["score"] for t in completed_tests) / len(completed_tests) if completed_tests else 0
    
    progress_docs = await db.student_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    
    total_materials = await db.study_materials.count_documents({"user_id": user["user_id"], "is_deleted": False})
    
    return {
        "total_tests": total_tests,
        "average_score": round(avg_score, 2),
        "total_materials": total_materials,
        "progress": progress_docs
    }

# AI Teacher Chat
class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

@api_router.post("/ai/chat")
async def ai_teacher_chat(body: ChatMessage, user: dict = Depends(get_current_user)):
    try:
        progress_docs = await db.student_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
        weak_topics = []
        for p in progress_docs:
            weak_topics.extend(p.get("weak_topics", []))
        
        student_context = ""
        if weak_topics:
            student_context = f"\nStudent's weak areas: {', '.join(set(weak_topics))}"
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"chat_{user['user_id']}_{uuid.uuid4().hex[:6]}",
            system_message=f"You are an expert teacher for Indian government exams (UPSC, APSC, ADRE, SSC, Banking). You help students prepare for their exams by explaining concepts clearly, providing practice strategies, and motivating them. Be concise but thorough. Use examples from Indian context.{student_context}"
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        context_prefix = f"[Context: {body.context}] " if body.context else ""
        user_message = UserMessage(text=f"{context_prefix}{body.message}")
        
        response = await chat.send_message(user_message)
        
        chat_doc = {
            "chat_id": f"chat_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "message": body.message,
            "response": response,
            "context": body.context,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)
        chat_doc.pop("_id", None)
        
        return {"response": response, "chat_id": chat_doc["chat_id"]}
    except Exception as e:
        logger.error(f"AI chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

@api_router.get("/ai/chat/history")
async def get_chat_history(user: dict = Depends(get_current_user)):
    chats = await db.chat_history.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return chats

# Interview Preparation
class InterviewRequest(BaseModel):
    exam_type: str
    position: str
    question_type: Optional[str] = "general"

@api_router.post("/interview/generate")
async def generate_interview_questions(body: InterviewRequest, user: dict = Depends(get_current_user)):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"interview_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert interview coach for Indian government service positions. Generate realistic interview questions and provide model answers with tips."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(
            text=f"Generate 5 interview questions for a {body.position} position in {body.exam_type}. Question type: {body.question_type}. For each question provide: the question, a model answer, key points to cover, and tips. Format as JSON array with fields: question, model_answer, key_points (array), tips."
        )
        
        response = await chat.send_message(user_message)
        
        import json
        import re
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            questions_data = json.loads(json_match.group())
        else:
            questions_data = json.loads(response)
        
        interview_doc = {
            "interview_id": f"int_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "exam_type": body.exam_type,
            "position": body.position,
            "question_type": body.question_type,
            "questions": questions_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.interview_prep.insert_one(interview_doc)
        interview_doc.pop("_id", None)
        
        return {"interview_id": interview_doc["interview_id"], "questions": questions_data}
    except Exception as e:
        logger.error(f"Interview generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Interview generation failed: {str(e)}")

@api_router.get("/interview/history")
async def get_interview_history(user: dict = Depends(get_current_user)):
    interviews = await db.interview_prep.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return interviews

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()