from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.schemas import DBUser

router = APIRouter()

class ProfileResponse(BaseModel):
    name: str
    email: str
    streak_count: int
    member_since: str

class UpdateProfileRequest(BaseModel):
    name: str
    email: str

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    try:
        user = db.query(DBUser).first()
        if not user:
            # Seed a default user for simplicity
            user = DBUser(
                email="jane@example.com",
                full_name="Jane Doe",
                streak_count=5,
                last_practice_date=datetime.utcnow() - timedelta(days=1)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return ProfileResponse(
            name=user.full_name,
            email=user.email,
            streak_count=user.streak_count,
            member_since="2026"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/profile", response_model=ProfileResponse)
def update_profile(payload: UpdateProfileRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(DBUser).first()
        if not user:
            user = DBUser(
                email=payload.email,
                full_name=payload.name,
                streak_count=1,
                last_practice_date=datetime.utcnow()
            )
            db.add(user)
        else:
            user.full_name = payload.name
            user.email = payload.email
            
        db.commit()
        db.refresh(user)
        
        return ProfileResponse(
            name=user.full_name,
            email=user.email,
            streak_count=user.streak_count,
            member_since="2026"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
