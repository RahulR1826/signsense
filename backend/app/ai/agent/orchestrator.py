import os
import json
from app.core.config import settings

class AIOrchestrator:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel("gemini-1.5-flash")
                print("[AIOrchestrator] Gemini API client initialized.")
            except Exception as e:
                print(f"[AIOrchestrator] Failed to initialize Gemini client: {e}")

    async def orchestrate(self, history: list[dict]) -> dict:
        if not history:
            return {
                "corrected_text": "",
                "analysis": {
                    "emergency_detected": False,
                    "translation": "",
                    "accessibility_guidance": "No active conversation context.",
                    "context_understanding": "Idle state."
                }
            }

        # Format conversation context for prompt
        formatted_history = []
        for msg in history:
            speaker = msg.get("speaker", "Unknown")
            text = msg.get("text", "")
            formatted_history.append(f"{speaker}: {text}")
        
        conversation_str = "\n".join(formatted_history)
        last_message = history[-1].get("text", "")
        last_speaker = history[-1].get("speaker", "")

        # If Gemini client is active, send prompt
        if self.client is not None:
            try:
                prompt = f"""
                You are the SignSense Agentic AI Orchestrator. 
                Your task is to coordinate sign language translation, grammar correction, multilingual translation, context analysis, emergency detection, and accessibility assistance.
                
                Here is the conversation history:
                {conversation_str}
                
                The last statement is from {last_speaker}: "{last_message}"
                
                Tasks:
                1. Grammar Correction: If the statement is raw sign language words (e.g., "nice meet you" or "heart pain"), rewrite it into a natural, grammatically correct English sentence.
                2. Translation: Translate the corrected statement to Spanish.
                3. Emergency Detection: Check if the statement indicates a medical, safety, or urgent emergency (e.g., pain, heart, danger, police, fire). Return true or false.
                4. Context Understanding: Give a brief description of the current topic or emotional context.
                5. Accessibility Guidance: Offer a suggestion to assist the communication (e.g., "Speak slowly", "Flagged medical alert").
                
                Return the result strictly as a valid JSON object matching this schema:
                {{
                    "corrected_text": "string (the natural English translation/refinement of the last statement)",
                    "analysis": {{
                        "emergency_detected": boolean,
                        "translation": "string (Spanish translation)",
                        "accessibility_guidance": "string",
                        "context_understanding": "string"
                    }}
                }}
                """
                response = self.client.generate_content(prompt)
                text_response = response.text.strip()
                
                # Extract JSON from markdown code block if present
                if "```json" in text_response:
                    text_response = text_response.split("```json")[1].split("```")[0].strip()
                elif "```" in text_response:
                    text_response = text_response.split("```")[1].split("```")[0].strip()
                
                data = json.loads(text_response)
                return data
            except Exception as e:
                print(f"[AIOrchestrator] Gemini inference failed: {e}. Falling back to rule-based engine.")

        # Rule-based fallback engine
        return self._rule_based_orchestration(last_speaker, last_message)

    def _rule_based_orchestration(self, last_speaker: str, last_message: str) -> dict:
        text = last_message.strip()
        
        # Simple word capitalization & ending punctuation
        corrected = text
        if text:
            corrected = text.capitalize()
            if not corrected.endswith(('.', '!', '?')):
                corrected += "."
                
        # Simple emergency detection keywords
        emergency_keywords = ["pain", "heart", "hurt", "danger", "police", "hospital", "doctor", "emergency", "die", "choke"]
        emergency_detected = any(k in text.lower() for k in emergency_keywords)
        
        # Basic translations
        translations = {
            "hello": "Hola.",
            "nice to meet you": "Gusto en conocerte.",
            "yes": "Sí.",
            "no": "No.",
            "help": "Ayuda.",
            "thank you": "Gracias."
        }
        translation = translations.get(text.lower(), f"Traducido: {corrected}")
        
        # Accessibility guidance
        if emergency_detected:
            accessibility_guidance = "CRITICAL: Emergency keywords detected. Keep camera active and notify medical personnel."
        elif last_speaker == "Deaf User":
            accessibility_guidance = "Deaf user signed. Read captions on screen. Respond clearly via voice or keyboard."
        else:
            accessibility_guidance = "Hearing user spoke. Transcribing voice to screen captions."

        # Context understanding
        if emergency_detected:
            context_understanding = "Urgent: User reporting potential pain or emergency."
        else:
            context_understanding = f"General conversation: User shared '{corrected}'."

        return {
            "corrected_text": corrected,
            "analysis": {
                "emergency_detected": emergency_detected,
                "translation": translation,
                "accessibility_guidance": accessibility_guidance,
                "context_understanding": context_understanding
            }
        }

orchestrator = AIOrchestrator()
