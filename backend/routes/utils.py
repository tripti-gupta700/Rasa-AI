from fastapi import APIRouter

router = APIRouter()

@router.get("/daily-tip")
def daily_tip(lang: str = "en"):
    return {
        "tip": "Drink warm water in the morning to balance Vata.",
        "lang": lang
    }

@router.get("/seasonal-wisdom")
def seasonal_wisdom(season: str, lang: str = "en"):
    return {
        "wisdom": f"{season} is a time for grounding foods and warm routines.",
        "lang": lang
    }
