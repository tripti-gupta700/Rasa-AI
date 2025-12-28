from fastapi import APIRouter, UploadFile, File
from services.vision_service import vision_service

router = APIRouter()

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()
    result = vision_service.analyze(content)
    return {"result": result}
