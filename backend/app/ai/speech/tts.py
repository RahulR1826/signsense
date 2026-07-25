import io
from gtts import gTTS

class TTSService:
    def text_to_speech(self, text: str, lang: str = "en") -> io.BytesIO:
        if not text:
            return io.BytesIO(b"")
            
        try:
            # Generate speech from text
            tts = gTTS(text=text, lang=lang)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp
        except Exception as e:
            print(f"[TTSService] gTTS rendering failed: {e}")
            return io.BytesIO(b"")

tts_service = TTSService()
