import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.ai.speech.tts import tts_service
from app.ai.speech.stt import stt_service

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    rate: float = 1.0
    voice: str = "en"

class STTResponse(BaseModel):
    text: str

@router.post("/text-to-speech")
def text_to_speech(payload: TTSRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")
        
    audio_stream = tts_service.text_to_speech(payload.text, lang=payload.voice)
    return StreamingResponse(audio_stream, media_type="audio/mpeg")

@router.post("/speech-to-text", response_model=STTResponse)
async def speech_to_text(file: UploadFile = File(...)):
    # Save UploadFile to a temporary local file
    try:
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
            
        # Perform transcription
        transcription = stt_service.speech_to_text(temp_path)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return STTResponse(text=transcription)
    except Exception as e:
        print(f"[Speech Route] Speech-to-Text conversion error: {e}")
        # Clean up in case of error
        try:
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to process speech file: {str(e)}")
