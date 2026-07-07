"""
video_source.py
---------------
Provides a unified interface for video frame acquisition from:
  1. Webcam (via OpenCV)
  2. Screen Region Capture (via MSS)

Usage:
    source = VideoSource(mode="webcam")
    source.start()
    frame = source.get_frame()   # Always returns BGR numpy array
    source.stop()
"""

import threading
import time
import tkinter as tk

import cv2
import mss
import numpy as np

# ---------------------------------------------------------------------------
# Region Selector  --  fullscreen overlay with click-and-drag
# ---------------------------------------------------------------------------

def capture_selected_area() -> tuple[int, int, int, int] | None:
    """
    Displays a fullscreen semi-transparent overlay and lets the user
    click-and-drag to select a screen region.

    Returns:
        (x, y, width, height)  – pixel coordinates of the selected area
        None                   – if the user cancelled (Escape key)

    Raises:
        ValueError: if the resulting region has zero width or height
    """
    result: dict = {"region": None}

    root = tk.Tk()
    root.attributes("-fullscreen", True)
    root.attributes("-alpha", 0.3)          # semi-transparent
    root.attributes("-topmost", True)
    root.configure(bg="black")
    root.title("Select Region – Drag to select, Escape to cancel")

    canvas = tk.Canvas(root, cursor="cross", bg="black", highlightthickness=0)
    canvas.pack(fill=tk.BOTH, expand=True)

    # State
    start_x = start_y = rect_id = 0

    def on_press(event):
        nonlocal start_x, start_y, rect_id
        start_x, start_y = event.x, event.y
        if rect_id:
            canvas.delete(rect_id)
        rect_id = canvas.create_rectangle(
            start_x, start_y, start_x, start_y,
            outline="red", width=3
        )

    def on_drag(event):
        canvas.coords(rect_id, start_x, start_y, event.x, event.y)

    def on_release(event):
        end_x, end_y = event.x, event.y
        x = min(start_x, end_x)
        y = min(start_y, end_y)
        w = abs(end_x - start_x)
        h = abs(end_y - start_y)

        if w < 10 or h < 10:
            show_message(canvas, "Region too small – try again or press Escape")
            return

        result["region"] = (x, y, w, h)
        root.destroy()

    def on_escape(event):
        result["region"] = "cancelled"
        root.destroy()

    def show_message(canvas, msg):
        canvas.create_text(
            canvas.winfo_width() // 2,
            canvas.winfo_height() // 2,
            text=msg,
            fill="white",
            font=("Arial", 20, "bold")
        )

    # Draw helper text
    def on_map(event):
        w = root.winfo_screenwidth()
        canvas.create_text(
            w // 2, 40,
            text="Click and drag to select a region. Press Escape to cancel.",
            fill="white",
            font=("Arial", 16, "bold")
        )

    canvas.bind("<ButtonPress-1>", on_press)
    canvas.bind("<B1-Motion>",     on_drag)
    canvas.bind("<ButtonRelease-1>", on_release)
    root.bind("<Escape>", on_escape)
    root.bind("<Map>", on_map)

    root.mainloop()

    region = result["region"]

    if region is None or region == "cancelled":
        return None

    x, y, w, h = region
    if w == 0 or h == 0:
        raise ValueError("Selected region has zero width or height.")

    return x, y, w, h


# ---------------------------------------------------------------------------
# VideoSource  –  unified webcam / screen-capture interface
# ---------------------------------------------------------------------------

class VideoSource:
    """
    Provides a common interface to grab BGR numpy-array frames from either:
      - "webcam"  : cv2.VideoCapture(0)
      - "screen"  : mss screen capture of a user-selected region

    Public API
    ----------
    start()         – begin capturing (non-blocking, starts background thread)
    stop()          – stop capturing and release resources
    get_frame()     – return the latest frame (BGR ndarray) or None
    is_running()    – True while the capture loop is active
    set_region()    – update the screen region on the fly (screen mode only)
    """

    # Supported modes
    MODE_WEBCAM = "webcam"
    MODE_SCREEN = "screen"

    def __init__(self, mode: str = MODE_WEBCAM, region: tuple | None = None):
        """
        Args:
            mode   : "webcam" | "screen"
            region : (x, y, w, h) for screen mode – required if mode="screen"
        """
        if mode not in (self.MODE_WEBCAM, self.MODE_SCREEN):
            raise ValueError(f"mode must be 'webcam' or 'screen', got '{mode}'")
        if mode == self.MODE_SCREEN and region is None:
            raise ValueError("region=(x,y,w,h) is required for screen mode")

        self.mode   = mode
        self.region = region  # (x, y, w, h) – used only in screen mode

        # Internal state
        self._frame:       np.ndarray | None = None
        self._lock:        threading.Lock     = threading.Lock()
        self._running:     bool               = False
        self._thread:      threading.Thread | None = None
        self._cap:         cv2.VideoCapture | None = None  # webcam handle

        # Statistics
        self._fps_counter: int   = 0
        self._fps:         float = 0.0

    # ------------------------------------------------------------------
    # Public control methods
    # ------------------------------------------------------------------

    def start(self) -> None:
        """Start the capture loop in a daemon thread."""
        if self._running:
            return
        self._running = True

        if self.mode == self.MODE_WEBCAM:
            self._thread = threading.Thread(
                target=self._webcam_loop, daemon=True, name="WebcamCapture"
            )
        else:
            self._thread = threading.Thread(
                target=self._screen_loop, daemon=True, name="ScreenCapture"
            )

        self._thread.start()

    def stop(self) -> None:
        """Stop the capture loop and release all resources."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        if self._cap:
            self._cap.release()
            self._cap = None
        with self._lock:
            self._frame = None

    def get_frame(self) -> np.ndarray | None:
        """
        Return the most recently captured frame as a BGR numpy array,
        or None if no frame is available yet.
        """
        with self._lock:
            return self._frame.copy() if self._frame is not None else None

    def is_running(self) -> bool:
        return self._running

    def set_region(self, region: tuple) -> None:
        """Update the screen-capture region while the loop is running."""
        x, y, w, h = region
        if w <= 0 or h <= 0:
            raise ValueError("Region width and height must be positive integers.")
        self.region = region

    @property
    def fps(self) -> float:
        return self._fps

    # ------------------------------------------------------------------
    # Internal capture loops
    # ------------------------------------------------------------------

    def _webcam_loop(self) -> None:
        """Capture loop for webcam mode."""
        self._cap = cv2.VideoCapture(0)

        if not self._cap.isOpened():
            self._running = False
            raise RuntimeError(
                "No webcam detected. Make sure a webcam is connected and accessible."
            )

        # Optional: set preferred resolution
        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT,  720)
        self._cap.set(cv2.CAP_PROP_FPS,            30)

        t0 = time.time()
        frames = 0

        while self._running:
            ret, frame = self._cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            with self._lock:
                self._frame = frame

            # FPS tracking
            frames += 1
            elapsed = time.time() - t0
            if elapsed >= 1.0:
                self._fps = frames / elapsed
                frames = 0
                t0 = time.time()

        self._cap.release()
        self._cap = None

    def _screen_loop(self) -> None:
        """Capture loop for screen-capture mode using MSS."""
        try:
            import mss as mss_lib
        except ImportError:
            self._running = False
            raise ImportError(
                "The 'mss' package is not installed. Run: pip install mss"
            )

        t0 = time.time()
        frames = 0

        with mss_lib.mss() as sct:
            while self._running:
                try:
                    x, y, w, h = self.region  # read each iteration (supports live updates)

                    monitor = {"left": x, "top": y, "width": w, "height": h}
                    screenshot = sct.grab(monitor)

                    # MSS gives us BGRA – convert to BGR for OpenCV
                    img = np.array(screenshot)           # shape: (h, w, 4)  BGRA
                    frame = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

                    with self._lock:
                        self._frame = frame

                    # FPS tracking
                    frames += 1
                    elapsed = time.time() - t0
                    if elapsed >= 1.0:
                        self._fps = frames / elapsed
                        frames = 0
                        t0 = time.time()

                except Exception as exc:          # pragma: no cover
                    print(f"[VideoSource] MSS capture error: {exc}")
                    time.sleep(0.05)              # brief pause before retry
