from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat, vision, translate, recommend, users
from routes import utils

app = FastAPI(title="Rasa AI – Local Ayurvedic Backend")

# ✅ ADD THIS BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(utils.router)
app.include_router(chat.router, prefix="/chat")
app.include_router(vision.router, prefix="/vision")
app.include_router(translate.router, prefix="/translate")
app.include_router(recommend.router, prefix="/recommend")

@app.on_event("startup")
async def startup():
    print("🚀 Rasa AI Backend Started")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)