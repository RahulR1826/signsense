import os
import json
import numpy as np
from app.core.config import settings

class PredictionService:
    def __init__(self):
        self.model = None
        self.labels = []
        
        # Load labels mapping first
        try:
            if os.path.exists(settings.LABELS_PATH):
                with open(settings.LABELS_PATH, "r", encoding="utf-8") as f:
                    label_mapping = json.load(f)
                    # Mapping is { "0": "A", "1": "B", ... }
                    self.labels = [label_mapping[str(i)] for i in sorted(label_mapping.keys(), key=int)]
                print(f"[PredictionService] Labels loaded: {self.labels}")
            else:
                self.labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["space", "del", "nothing"]
                print(f"[PredictionService] Labels file not found. Using default fallback labels.")
        except Exception as e:
            print(f"[PredictionService] Failed to load labels: {e}")
            self.labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["space", "del", "nothing"]

        # Try loading Keras model
        try:
            if os.path.exists(settings.MODEL_PATH):
                # Lazy import of tensorflow to prevent delays on basic routes
                from tensorflow import keras
                self.model = keras.models.load_model(settings.MODEL_PATH)
                print(f"[PredictionService] Model loaded from {settings.MODEL_PATH}")
            else:
                print(f"[PredictionService] WARNING: Model not found at {settings.MODEL_PATH}")
        except Exception as e:
            print(f"[PredictionService] Failed to load TensorFlow model: {e}")

    def predict(self, landmarks: list[float]) -> dict:
        if not landmarks or len(landmarks) != 63:
            return {"label": "nothing", "confidence": 0.0}
            
        if self.model is not None:
            try:
                x = np.array(landmarks, dtype="float32").reshape(1, -1)
                probs = self.model.predict(x, verbose=0)[0]
                idx = int(np.argmax(probs))
                confidence = float(probs[idx])
                if idx < len(self.labels):
                    return {"label": self.labels[idx], "confidence": confidence}
                return {"label": "nothing", "confidence": 0.0}
            except Exception as e:
                print(f"[PredictionService] Prediction error: {e}")
                
        # Demo / Fallback mode
        import random
        valid_labels = [l for l in self.labels if l not in ("del", "nothing")]
        label = random.choice(valid_labels) if valid_labels else "A"
        return {"label": label, "confidence": 0.85}

prediction_service = PredictionService()
