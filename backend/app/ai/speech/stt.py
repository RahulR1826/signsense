import speech_recognition as sr

class STTService:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def speech_to_text(self, audio_file_path: str) -> str:
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio_data = self.recognizer.record(source)
                # Use Google Web Speech API (free tier, no credentials needed)
                text = self.recognizer.recognize_google(audio_data)
                return text
        except sr.UnknownValueError:
            print("[STTService] Google Speech Recognition could not understand audio")
            return ""
        except sr.RequestError as e:
            print(f"[STTService] Could not request results from Google service; {e}")
            return ""
        except Exception as e:
            print(f"[STTService] Transcription error: {e}")
            return ""

stt_service = STTService()
