from pydantic import BaseModel
from typing import Optional, List

class ChatMessage(BaseModel):
    id: Optional[int] = None
    role: str   # "user" | "assistant" | "system"
    content: str
    lang: Optional[str] = "en"

class ChatRequest(BaseModel):
    message: str

class ChatChunk(BaseModel):
    chunk: str

class ChatResponse(BaseModel):
    reply: str
    
class CompleteMessageRequest(BaseModel):
    userId: str
    messageId: int
    text: str
    lang: str