from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.ai.agent.orchestrator import orchestrator

router = APIRouter()

class Message(BaseModel):
    speaker: str  # "Deaf User" or "Hearing User"
    text: str
    confidence: Optional[float] = None

class AgentRequest(BaseModel):
    history: list[Message]

@router.post("/chat-agent")
async def chat_agent(payload: AgentRequest):
    if not payload.history:
         raise HTTPException(status_code=400, detail="Conversation history cannot be empty")
         
    # Convert Pydantic schemas to standard dictionaries
    history_dicts = [
        {"speaker": msg.speaker, "text": msg.text, "confidence": msg.confidence}
        for msg in payload.history
    ]
    
    result = await orchestrator.orchestrate(history_dicts)
    return result
