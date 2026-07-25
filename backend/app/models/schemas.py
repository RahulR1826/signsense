import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database.connection import Base

class DBUser(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    streak_count = Column(Integer, default=0)
    last_practice_date = Column(DateTime, default=datetime.utcnow)

class DBConversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    speaker = Column(String)  # "Deaf User" or "Hearing User"
    text = Column(String)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBAnalytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    avg_accuracy = Column(Float)
    practice_duration_mins = Column(Integer)
    session_date = Column(DateTime, default=datetime.utcnow)

class DBDatasetSample(Base):
    __tablename__ = "dataset_samples"
    
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, index=True)
    landmarks_json = Column(Text)  # JSON representation of 63 coordinates
    created_at = Column(DateTime, default=datetime.utcnow)
    
    @property
    def landmarks(self):
        return json.loads(self.landmarks_json) if self.landmarks_json else []
        
    @landmarks.setter
    def landmarks(self, value):
        self.landmarks_json = json.dumps(value)
