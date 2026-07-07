"""
predictor.py
------------
Loads a trained Keras model and maps landmark vectors to sign labels.

Keeps the full prediction pipeline (model + label mapping + sentence
builder + TTS) completely isolated from the video source.
"""

import os
import threading
import time
from collections import deque

import numpy as np

# ---------------------------------------------------------------------------
# Optional TTS (pyttsx3) – gracefully degrades if not installed
# ---------------------------------------------------------------------------
try:
    import pyttsx3
    _TTS_AVAILABLE = True
except ImportError:
    _TTS_AVAILABLE = False

# ---------------------------------------------------------------------------
# Optional Keras
# ---------------------------------------------------------------------------
try:
    from tensorflow import keras
    _KERAS_AVAILABLE = True
except ImportError:
    _KERAS_AVAILABLE = False


# ---------------------------------------------------------------------------

class Predictor:
    """
    Wraps a Keras classifier for hand-sign labels.

    Args:
        model_path  : path to a saved .h5 / SavedModel
        labels      : ordered list of class names matching model output nodes
        smoothing   : number of recent predictions to majority-vote over
        tts_enabled : if True and pyttsx3 is installed, speak sentences
    """

    def __init__(
        self,
        model_path:  str       = "model/hand_sign_model.h5",
        labels:      list[str] = None,
        smoothing:   int       = 10,
        tts_enabled: bool      = True,
    ):
        self.labels      = labels or []
        self.smoothing   = smoothing
        self.tts_enabled = tts_enabled and _TTS_AVAILABLE

        # Rolling prediction buffer for temporal smoothing
        self._buffer: deque[str] = deque(maxlen=smoothing)

        # Sentence / word accumulation
        self._current_word:     str  = ""
        self._sentence:         str  = ""
        self._last_sign:        str  = ""
        self._same_sign_count:  int  = 0
        self._word_commit_hold: int  = 20   # frames the same sign must hold

        # Load model
        self._model = None
        if _KERAS_AVAILABLE and os.path.exists(model_path):
            self._model = keras.models.load_model(model_path)
        else:
            print(
                f"[Predictor] WARNING – model not found at '{model_path}'. "
                "Running in demo mode (random labels)."
            )

        # TTS engine (runs in its own thread to avoid blocking UI)
        self._tts_engine = None
        self._tts_queue:  deque[str] = deque()
        if self.tts_enabled:
            self._init_tts()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(self, landmarks: list[float]) -> str | None:
        """
        Args:
            landmarks : flat list of 63 floats from HandSignDetector

        Returns:
            The smoothed predicted label string, or None
        """
        if not landmarks:
            return None

        raw_label = self._run_model(landmarks)
        if raw_label is None:
            return None

        self._buffer.append(raw_label)

        # Majority vote over the rolling buffer
        if len(self._buffer) < self.smoothing:
            return None

        from collections import Counter
        label, _ = Counter(self._buffer).most_common(1)[0]
        return label

    def update_sentence(self, label: str | None) -> tuple[str, str]:
        """
        Accumulate held signs into words and words into a sentence.

        Returns:
            (current_word, sentence)
        """
        if label is None:
            return self._current_word, self._sentence

        if label == self._last_sign:
            self._same_sign_count += 1
        else:
            self._same_sign_count = 1
            self._last_sign = label

        # Commit letter to word after holding long enough
        if self._same_sign_count == self._word_commit_hold:
            if label == "space":
                self._sentence += self._current_word + " "
                if self.tts_enabled:
                    self._speak(self._current_word)
                self._current_word = ""
            elif label == "del":
                self._current_word = self._current_word[:-1]
            elif label == "nothing":
                pass
            else:
                self._current_word += label

        return self._current_word, self._sentence

    def reset(self) -> None:
        """Clear word, sentence, and prediction buffer."""
        self._buffer.clear()
        self._current_word = ""
        self._sentence     = ""
        self._last_sign    = ""
        self._same_sign_count = 0

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _run_model(self, landmarks: list[float]) -> str | None:
        """Run inference. Falls back to a random pick in demo mode."""
        if self._model is not None:
            x = np.array(landmarks, dtype="float32").reshape(1, -1)
            probs = self._model.predict(x, verbose=0)[0]
            idx   = int(np.argmax(probs))
            if idx < len(self.labels):
                return self.labels[idx]
            return None

        # Demo / no-model mode
        if self.labels:
            return np.random.choice(self.labels)
        return None

    # ------------------------------------------------------------------
    # TTS helpers
    # ------------------------------------------------------------------

    def _init_tts(self) -> None:
        try:
            self._tts_engine = pyttsx3.init()
            self._tts_engine.setProperty("rate", 150)
            t = threading.Thread(target=self._tts_worker, daemon=True)
            t.start()
        except Exception as exc:
            print(f"[Predictor] TTS init failed: {exc}")
            self.tts_enabled = False

    def _speak(self, text: str) -> None:
        if self.tts_enabled and text.strip():
            self._tts_queue.append(text)

    def _tts_worker(self) -> None:
        while True:
            if self._tts_queue:
                text = self._tts_queue.popleft()
                try:
                    self._tts_engine.say(text)
                    self._tts_engine.runAndWait()
                except Exception:
                    pass
            else:
                time.sleep(0.05)
