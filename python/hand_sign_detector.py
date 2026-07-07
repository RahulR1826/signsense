"""
hand_sign_detector.py
----------------------
MediaPipe hand landmark detection wrapper.

Processes a single BGR frame and returns normalised landmark coordinates
ready for the classifier. Completely source-agnostic – accepts any OpenCV
BGR numpy array from VideoSource.get_frame().
"""

import cv2
import mediapipe as mp
import numpy as np

# ---------------------------------------------------------------------------
# MediaPipe setup
# ---------------------------------------------------------------------------

_mp_hands    = mp.solutions.hands
_mp_drawing  = mp.solutions.drawing_utils
_mp_styles   = mp.solutions.drawing_styles


class HandSignDetector:
    """
    Wraps MediaPipe Hands for real-time hand detection and landmark extraction.

    Usage
    -----
        detector = HandSignDetector()
        landmarks, annotated_frame = detector.process(frame)
        # landmarks  : flat list of 63 floats (21 points × [x, y, z])
        #              or None if no hand detected
        # annotated_frame : BGR frame with landmarks drawn on it
    """

    def __init__(
        self,
        static_image_mode:        bool  = False,
        max_num_hands:            int   = 1,
        min_detection_confidence: float = 0.7,
        min_tracking_confidence:  float = 0.5,
    ):
        self.hands = _mp_hands.Hands(
            static_image_mode        = static_image_mode,
            max_num_hands            = max_num_hands,
            min_detection_confidence = min_detection_confidence,
            min_tracking_confidence  = min_tracking_confidence,
        )

    # ------------------------------------------------------------------

    def process(self, frame: np.ndarray) -> tuple[list | None, np.ndarray]:
        """
        Run hand detection on a BGR frame.

        Args:
            frame : BGR numpy array

        Returns:
            (landmarks, annotated_frame)
              landmarks       – flat list of 63 floats, or None
              annotated_frame – BGR frame with landmarks drawn
        """
        if frame is None:
            return None, np.zeros((480, 640, 3), dtype=np.uint8)

        annotated = frame.copy()
        rgb        = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False
        results    = self.hands.process(rgb)
        rgb.flags.writeable = True

        if not results.multi_hand_landmarks:
            return None, annotated

        # Use first detected hand only (max_num_hands=1 by default)
        hand_landmarks = results.multi_hand_landmarks[0]

        # Draw skeleton on annotated frame
        _mp_drawing.draw_landmarks(
            annotated,
            hand_landmarks,
            _mp_hands.HAND_CONNECTIONS,
            _mp_styles.get_default_hand_landmarks_style(),
            _mp_styles.get_default_hand_connections_style(),
        )

        # Extract normalised coords as a flat list: [x0,y0,z0, x1,y1,z1, ...]
        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        return landmarks, annotated

    # ------------------------------------------------------------------

    def close(self) -> None:
        """Release MediaPipe resources."""
        self.hands.close()

    # context-manager support
    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
