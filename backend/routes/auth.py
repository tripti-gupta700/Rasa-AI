from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None

@router.post("/login")
def login(payload: LoginRequest):
    return {
        "id": "user_1",
        "email": payload.email,
        "role": "user"
    }

@router.post("/signup")
def signup(payload: SignupRequest):
    return {
        "id": "user_1",
        "email": payload.email,
        "role": "user"
    }

@router.post("/consultant/signup")
def consultant_signup(payload: SignupRequest):
    return {
        "id": "consultant_1",
        "email": payload.email,
        "role": "consultant"
    }
