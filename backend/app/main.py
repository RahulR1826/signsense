import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.routes import predict, speech, agent, dataset, history, analytics, profile
from app.core.config import settings

# Automatically create tables in SQLite/PostgreSQL
try:
    Base.metadata.create_all(bind=engine)
    print("[Main] Database tables created successfully.")
except Exception as e:
    print(f"[Main] Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend services for the SignSense ASL recognition platform.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up routers
app.include_router(predict.router, prefix=settings.API_V1_STR, tags=["Prediction"])
app.include_router(speech.router, prefix=settings.API_V1_STR, tags=["Speech"])
app.include_router(agent.router, prefix=settings.API_V1_STR, tags=["Agentic AI"])
app.include_router(dataset.router, prefix=settings.API_V1_STR, tags=["Dataset Collection"])
app.include_router(history.router, prefix=settings.API_V1_STR, tags=["Conversation History"])
app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["Analytics"])
app.include_router(profile.router, prefix=settings.API_V1_STR, tags=["User Profile"])

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
