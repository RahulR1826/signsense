from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.prediction_service import prediction_service

router = APIRouter()

class PredictionRequest(BaseModel):
    landmarks: list[float]

class PredictionResponse(BaseModel):
    label: str
    confidence: float

@router.post("/predict", response_model=PredictionResponse)
def predict_landmark(payload: PredictionRequest):
    if len(payload.landmarks) != 63:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 63 float coordinates (21 points * 3 dims), got {len(payload.landmarks)}"
        )
    
    result = prediction_service.predict(payload.landmarks)
    return PredictionResponse(
        label=result["label"],
        confidence=result["confidence"]
    )
