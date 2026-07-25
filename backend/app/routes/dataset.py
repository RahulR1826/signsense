import os
import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.schemas import DBDatasetSample

router = APIRouter()

class DatasetSampleRequest(BaseModel):
    label: str
    data: list[float]

@router.post("/save")
def save_dataset_sample(payload: DatasetSampleRequest, db: Session = Depends(get_db)):
    if len(payload.data) != 63:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 63 float values, got {len(payload.data)}"
        )
        
    try:
        # 1. Save to Database
        db_sample = DBDatasetSample(label=payload.label)
        db_sample.landmarks = payload.data  # uses the setter to serialize
        db.add(db_sample)
        db.commit()
        
        # 2. Save to Disk (for backward compatibility with existing training script)
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
        label_dir = root_dir / "dataset" / payload.label
        label_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = label_dir / f"{int(datetime.utcnow().timestamp() * 1000)}.json"
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump({
                "label": payload.label,
                "data": payload.data
            }, f)
            
        return {"success": True}
    except Exception as e:
        print(f"[Dataset Route] Error saving sample: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save sample: {str(e)}")
