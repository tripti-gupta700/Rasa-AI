from pydantic import BaseModel
from typing import Optional, List

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

# ---------- TRANSLATION ----------
class TranslateRequest(BaseModel):
    text: str
    target: str  # "hi" | "en"


class TranslateResponse(BaseModel):
    translated: str


# ---------- VISION ----------
class VisionRequest(BaseModel):
    base64: str
    mime: str
    prompt: Optional[str] = ""
    lang: Optional[str] = "en"


class VisionResponse(BaseModel):
    caption: str
    dosha: str
    advice: str


# ---------- DAILY TIP ----------
class DailyTipResponse(BaseModel):
    tip: str
    source: str


# ---------- SEASONAL WISDOM ----------
class SeasonalWisdomResponse(BaseModel):
    wisdom: str


# ---------- RECOMMENDATION ----------
class RecommendRequest(BaseModel):
    query: str


class RecommendResponse(BaseModel):
    tip: str
