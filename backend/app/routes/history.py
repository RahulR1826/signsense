from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.connection import get_db
from app.models.schemas import DBConversation

router = APIRouter()

class ConversationItemSchema(BaseModel):
    id: Optional[int] = None
    speaker: str
    text: str
    confidence: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AddConversationRequest(BaseModel):
    speaker: str
    text: str
    confidence: Optional[float] = None

@router.get("/history", response_model=list[ConversationItemSchema])
def get_conversations(db: Session = Depends(get_db)):
    # Return conversations sorted chronologically
    return db.query(DBConversation).order_by(DBConversation.created_at.asc()).all()

@router.post("/history", response_model=ConversationItemSchema)
def add_conversation(payload: AddConversationRequest, db: Session = Depends(get_db)):
    try:
        db_msg = DBConversation(
            speaker=payload.speaker,
            text=payload.text,
            confidence=payload.confidence
        )
        db.add(db_msg)
        db.commit()
        db.refresh(db_msg)
        return db_msg
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/history")
def clear_conversations(db: Session = Depends(get_db)):
    try:
        db.query(DBConversation).delete()
        db.commit()
        return {"success": True, "message": "Timeline cleared"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
