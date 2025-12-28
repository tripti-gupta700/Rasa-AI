from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.chat_service import chat_service
from services.chat_store import chat_db
from models.chat import ChatRequest, ChatMessage, CompleteMessageRequest
from typing import List

router = APIRouter(prefix="/chat", tags=["Chat"])

# -------- Streaming chat --------
@router.post("/stream")
async def stream_chat(req: ChatRequest):
    generator = chat_service.stream(req.message)
    return StreamingResponse(generator, media_type="text/plain")

# ---------------------------------------------------
# GET CHAT HISTORY
# ---------------------------------------------------
@router.get("/history/{user_id}", response_model=List[ChatMessage])
async def get_chat_history(user_id: str):
    return chat_db.get(user_id, [])

# ---------------------------------------------------
# SAVE MESSAGE (user message)
# ---------------------------------------------------
@router.post("/message")
async def save_message(payload: dict):
    user_id = payload["userId"]
    message = ChatMessage(**payload["message"])

    chat_db.setdefault(user_id, []).append(message)
    return {"status": "saved"}

# ---------------------------------------------------
# COMPLETE AI MESSAGE
# ---------------------------------------------------
@router.post("/message/complete")
async def save_complete_message(req: CompleteMessageRequest):
    messages = chat_db.setdefault(req.userId, [])

    messages.append(
        ChatMessage(
            id=req.messageId,
            role="assistant",
            content=req.text,
            lang=req.lang
        )
    )

    return {"status": "completed"}

# -------- Normal chat --------
@router.post("")
async def chat(req: ChatRequest):
    return {
        "response": chat_service.chat(req.message)
    }
