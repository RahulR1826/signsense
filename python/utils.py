"""
utils.py
--------
Shared drawing and formatting helpers used by ui_app.py.
"""

import cv2
import numpy as np


# ---------------------------------------------------------------------------
# Frame annotation
# ---------------------------------------------------------------------------

def draw_overlay(
    frame:        np.ndarray,
    label:        str | None,
    current_word: str,
    sentence:     str,
    fps:          float,
    source_name:  str,
) -> np.ndarray:
    """
    Burn sign label, word, sentence, FPS, and source name onto the frame.

    Args:
        frame        : BGR numpy array (will NOT be modified in-place)
        label        : current predicted sign label (or None)
        current_word : characters accumulated so far
        sentence     : completed words
        fps          : capture FPS float
        source_name  : "Webcam" | "Screen Capture"

    Returns:
        Annotated BGR numpy array
    """
    out = frame.copy()
    h, w = out.shape[:2]

    # Semi-transparent black bar at bottom
    overlay = out.copy()
    cv2.rectangle(overlay, (0, h - 120), (w, h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.55, out, 0.45, 0, out)

    # --- Text lines ---
    font       = cv2.FONT_HERSHEY_SIMPLEX
    green      = (0,  210, 100)
    white      = (240, 240, 240)
    yellow     = (30,  200, 255)
    light_gray = (160, 160, 160)

    # Sign label (top-left)
    if label:
        cv2.putText(out, f"Sign: {label.upper()}", (16, 48),
                    font, 1.4, green, 3, cv2.LINE_AA)

    # FPS  &  Source  (top-right)
    fps_text = f"{fps:.1f} FPS  |  {source_name}"
    (fw, _), _ = cv2.getTextSize(fps_text, font, 0.65, 1)
    cv2.putText(out, fps_text, (w - fw - 12, 36),
                font, 0.65, light_gray, 1, cv2.LINE_AA)

    # Word being built
    cv2.putText(out, f"Word : {current_word}_", (16, h - 80),
                font, 0.85, yellow, 2, cv2.LINE_AA)

    # Sentence so far
    cv2.putText(out, f"Sentence: {sentence}", (16, h - 44),
                font, 0.75, white, 1, cv2.LINE_AA)

    return out


# ---------------------------------------------------------------------------
# Frame conversion helpers
# ---------------------------------------------------------------------------

def resize_to_fit(frame: np.ndarray, max_w: int, max_h: int) -> np.ndarray:
    """Proportionally resize frame so it fits within (max_w, max_h)."""
    h, w = frame.shape[:2]
    scale = min(max_w / w, max_h / h, 1.0)
    if scale < 1.0:
        new_w, new_h = int(w * scale), int(h * scale)
        return cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return frame


def bgr_to_pil_bytes(frame: np.ndarray) -> bytes:
    """Encode a BGR frame to JPEG bytes (for Tkinter PhotoImage via PIL)."""
    from PIL import Image, ImageTk   # local import to keep utils.py lightweight
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)
