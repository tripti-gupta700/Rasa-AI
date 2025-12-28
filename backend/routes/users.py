from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# -------- Schemas --------
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    language: Optional[str] = None

class ConsultantProfileUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    experienceYears: Optional[int] = None
    consultationFee: Optional[float] = None

# -------- User Profile --------
@router.put("/{user_id}/profile")
def update_user_profile(user_id: str, payload: UserProfileUpdate):
    return {
        "id": user_id,
        "role": "user",
        "profile": payload.dict()
    }

# -------- Consultant Profile --------
@router.put("/{consultant_id}/consultant-profile")
def update_consultant_profile(consultant_id: str, payload: ConsultantProfileUpdate):
    return {
        "id": consultant_id,
        "role": "consultant",
        "profile": payload.dict()
    }
