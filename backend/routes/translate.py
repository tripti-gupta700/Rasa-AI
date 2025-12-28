from fastapi import APIRouter
from services.translation import translation_service
from models.schemas import TranslateRequest, TranslateResponse

router = APIRouter(prefix="/translate", tags=["Translate"])


@router.post("/", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    translated_text = translation_service.translate(req.text)
    return TranslateResponse(translated=translated_text)
