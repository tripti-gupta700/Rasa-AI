from fastapi import APIRouter
from services.recommend_service import recommend_service

router = APIRouter()

@router.post("/")
async def recommend(payload: dict):
    return {
        "tip": recommend_service.run(payload["query"])
    }
