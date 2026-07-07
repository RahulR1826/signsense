"""
ui_app.py
---------
Modern Tkinter application for Hand Sign Language Recognition.
Supports Webcam and Screen-Capture video sources.

Run:
    python ui_app.py
"""

import threading
import tkinter as tk
from tkinter import messagebox

import cv2
from PIL import Image, ImageTk

from hand_sign_detector import HandSignDetector
from predictor import Predictor
from utils import draw_overlay, resize_to_fit
from video_source import VideoSource, capture_selected_area

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

WINDOW_TITLE  = "SignSense – Hand Sign Language Recognition"
CANVAS_W      = 960
CANVAS_H      = 600
UPDATE_DELAY  = 16          # ms  (~60 FPS UI refresh)
MODEL_PATH    = "model/hand_sign_model.h5"

# Labels must match the order of model output nodes.
# If you have a labels file, load it instead.
LABELS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["space", "del", "nothing"]


# ---------------------------------------------------------------------------
# Main Application
# ---------------------------------------------------------------------------

class SignSenseApp:
    """
    Full Tkinter-based GUI that:
      - Shows a live camera / screen-capture feed.
      - Runs MediaPipe hand detection on every frame.
      - Classifies detected landmarks with a Keras model.
      - Builds words / sentences and (optionally) speaks them.
    """

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title(WINDOW_TITLE)
        self.root.configure(bg="#0d0d0f")
        self.root.resizable(True, True)

        # Core components
        self.detector  = HandSignDetector(max_num_hands=1)
        self.predictor = Predictor(model_path=MODEL_PATH, labels=LABELS, tts_enabled=True)

        # Video source state
        self.video_source:  VideoSource | None = None
        self.source_mode:   str                = "none"  # "webcam" | "screen" | "none"
        self.screen_region: tuple | None       = None

        # UI state
        self._photo_ref = None        # keep a reference to avoid GC
        self._update_job = None       # Tkinter .after() handle

        self._build_ui()

    # ==================================================================
    # UI Construction
    # ==================================================================

    def _build_ui(self) -> None:
        # ── Left Panel (controls) ──────────────────────────────────────
        left = tk.Frame(self.root, bg="#12121a", width=240)
        left.pack(side=tk.LEFT, fill=tk.Y, padx=0, pady=0)
        left.pack_propagate(False)

        # Logo / title
        logo_frame = tk.Frame(left, bg="#12121a", pady=20)
        logo_frame.pack(fill=tk.X)
        tk.Label(
            logo_frame,
            text="✋  SignSense",
            font=("Segoe UI", 18, "bold"),
            fg="#34d399", bg="#12121a"
        ).pack()
        tk.Label(
            logo_frame,
            text="Hand Sign Recognition",
            font=("Segoe UI", 9),
            fg="#6b7280", bg="#12121a"
        ).pack()

        tk.Frame(left, bg="#1f2937", height=1).pack(fill=tk.X, padx=16)

        # Status indicator
        self.status_var = tk.StringVar(value="● Idle")
        self.status_label = tk.Label(
            left,
            textvariable=self.status_var,
            font=("Segoe UI", 10, "bold"),
            fg="#6b7280", bg="#12121a",
            pady=12
        )
        self.status_label.pack(fill=tk.X, padx=20)

        # Source pill
        self.source_var = tk.StringVar(value="No Source")
        tk.Label(
            left,
            textvariable=self.source_var,
            font=("Segoe UI", 9),
            fg="#9ca3af", bg="#1a1a2e",
            relief=tk.FLAT, pady=6, padx=12
        ).pack(fill=tk.X, padx=16, pady=(0, 16))

        # ── Buttons ───────────────────────────────────────────────────
        btn_cfg = dict(
            font=("Segoe UI", 11, "bold"),
            relief=tk.FLAT,
            bd=0,
            pady=10,
            padx=8,
            cursor="hand2",
        )

        self._btn_webcam = self._make_btn(
            left, "🎥  Start Webcam",
            self._on_start_webcam,
            bg="#059669", fg="white", **btn_cfg
        )
        self._btn_region = self._make_btn(
            left, "🖥  Select Screen Region",
            self._on_select_region,
            bg="#2563eb", fg="white", **btn_cfg
        )
        self._btn_screen = self._make_btn(
            left, "▶  Start Screen Capture",
            self._on_start_screen,
            bg="#7c3aed", fg="white", **btn_cfg
        )
        self._btn_stop = self._make_btn(
            left, "⏹  Stop Capture",
            self._on_stop,
            bg="#b91c1c", fg="white", **btn_cfg
        )
        self._btn_reset = self._make_btn(
            left, "🔄  Reset Sentence",
            self._on_reset,
            bg="#374151", fg="white", **btn_cfg
        )
        self._btn_exit = self._make_btn(
            left, "✕  Exit",
            self._on_exit,
            bg="#1f2937", fg="#9ca3af", **btn_cfg
        )

        # Initially disable screen start until region is selected
        self._btn_screen.config(state=tk.DISABLED)
        self._btn_stop.config(state=tk.DISABLED)

        # ── FPS label (bottom of left panel) ──────────────────────────
        self.fps_var = tk.StringVar(value="FPS: —")
        tk.Label(
            left,
            textvariable=self.fps_var,
            font=("Consolas", 9),
            fg="#4b5563", bg="#12121a",
            anchor=tk.W
        ).pack(side=tk.BOTTOM, padx=20, pady=8, fill=tk.X)

        # ── Right Panel (video canvas) ────────────────────────────────
        right = tk.Frame(self.root, bg="#0d0d0f")
        right.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(
            right,
            width=CANVAS_W, height=CANVAS_H,
            bg="#111118", highlightthickness=0
        )
        self.canvas.pack(fill=tk.BOTH, expand=True, padx=12, pady=12)

        # Placeholder text on canvas
        self._canvas_placeholder()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _make_btn(self, parent, text, command, **kwargs) -> tk.Button:
        btn = tk.Button(parent, text=text, command=command, **kwargs)
        btn.pack(fill=tk.X, padx=16, pady=4)
        btn.bind("<Enter>", lambda e, b=btn: b.config(relief=tk.GROOVE))
        btn.bind("<Leave>", lambda e, b=btn: b.config(relief=tk.FLAT))
        return btn

    def _canvas_placeholder(self) -> None:
        self.canvas.delete("placeholder")
        self.canvas.create_text(
            CANVAS_W // 2, CANVAS_H // 2,
            text="No video source active.\nPress  'Start Webcam'  or  'Select Screen Region'.",
            fill="#3a3a4e",
            font=("Segoe UI", 15),
            justify=tk.CENTER,
            tags="placeholder"
        )

    def _set_status(self, text: str, color: str = "#34d399") -> None:
        self.status_var.set(f"● {text}")
        self.status_label.config(fg=color)

    # ==================================================================
    # Button callbacks
    # ==================================================================

    def _on_start_webcam(self) -> None:
        self._stop_current_source()
        try:
            self.video_source = VideoSource(mode=VideoSource.MODE_WEBCAM)
            self.video_source.start()
        except RuntimeError as exc:
            messagebox.showerror("Webcam Error", str(exc))
            return

        self.source_mode = "webcam"
        self.source_var.set("Current Source: Webcam")
        self._set_status("Webcam Active")
        self._btn_stop.config(state=tk.NORMAL)
        self._btn_webcam.config(state=tk.DISABLED)

        self._start_ui_loop()

    def _on_select_region(self) -> None:
        """Open fullscreen region selector, then enable Start Screen Capture."""
        # Minimise app window so it doesn't block the selector
        self.root.iconify()
        self.root.update()

        try:
            region = capture_selected_area()
        except ValueError as exc:
            self.root.deiconify()
            messagebox.showerror("Region Error", str(exc))
            return

        self.root.deiconify()

        if region is None:
            messagebox.showinfo("Cancelled", "Region selection was cancelled.")
            return

        self.screen_region = region
        x, y, w, h = region
        self.source_var.set(f"Region: {w}×{h} @ ({x},{y})")
        self._btn_screen.config(state=tk.NORMAL)
        self._set_status("Region selected – ready", "#facc15")

    def _on_start_screen(self) -> None:
        if self.screen_region is None:
            messagebox.showwarning("No Region", "Please select a screen region first.")
            return

        self._stop_current_source()
        try:
            self.video_source = VideoSource(
                mode   = VideoSource.MODE_SCREEN,
                region = self.screen_region,
            )
            self.video_source.start()
        except Exception as exc:
            messagebox.showerror("Screen Capture Error", str(exc))
            return

        self.source_mode = "screen"
        x, y, w, h = self.screen_region
        self.source_var.set(f"Current Source: Screen  [{w}×{h}]")
        self._set_status("Screen Capture Active")
        self._btn_stop.config(state=tk.NORMAL)
        self._btn_screen.config(state=tk.DISABLED)

        self._start_ui_loop()

    def _on_stop(self) -> None:
        self._stop_current_source()
        self._set_status("Stopped", "#6b7280")
        self.source_var.set("No Source")
        self._btn_stop.config(state=tk.DISABLED)
        self._btn_webcam.config(state=tk.NORMAL)
        if self.screen_region:
            self._btn_screen.config(state=tk.NORMAL)
        self._canvas_placeholder()

    def _on_reset(self) -> None:
        self.predictor.reset()

    def _on_exit(self) -> None:
        self._stop_current_source()
        self.detector.close()
        self.root.destroy()

    # ==================================================================
    # Capture → Detection → Prediction → Display loop
    # ==================================================================

    def _start_ui_loop(self) -> None:
        """Schedule the first frame update."""
        if self._update_job is not None:
            self.root.after_cancel(self._update_job)
        self._update_job = self.root.after(UPDATE_DELAY, self._update_frame)

    def _update_frame(self) -> None:
        """
        Called every UPDATE_DELAY ms by Tkinter's event loop.
        Grabs a frame → detects hand → predicts sign → updates canvas.
        """
        if self.video_source is None or not self.video_source.is_running():
            return

        frame = self.video_source.get_frame()

        if frame is None:
            self._update_job = self.root.after(UPDATE_DELAY, self._update_frame)
            return

        # ── Hand detection (MediaPipe) ──
        landmarks, annotated = self.detector.process(frame)

        # ── Sign prediction ──
        label = self.predictor.predict(landmarks)
        current_word, sentence = self.predictor.update_sentence(label)

        # ── Annotate frame ──
        source_name = "Webcam" if self.source_mode == "webcam" else "Screen Capture"
        display = draw_overlay(
            annotated, label, current_word, sentence,
            self.video_source.fps, source_name
        )

        # ── Resize to fit canvas ──
        cw = self.canvas.winfo_width()  or CANVAS_W
        ch = self.canvas.winfo_height() or CANVAS_H
        display = resize_to_fit(display, cw, ch)

        # ── Push to Tkinter canvas ──
        rgb   = cv2.cvtColor(display, cv2.COLOR_BGR2RGB)
        img   = Image.fromarray(rgb)
        photo = ImageTk.PhotoImage(image=img)

        # Centre the frame on the canvas
        x_off = (cw - display.shape[1]) // 2
        y_off = (ch - display.shape[0]) // 2

        self.canvas.delete("frame")
        self.canvas.create_image(x_off, y_off, anchor=tk.NW, image=photo, tags="frame")
        self._photo_ref = photo        # prevent garbage collection

        # ── Update FPS counter ──
        self.fps_var.set(f"FPS: {self.video_source.fps:.1f}")

        # ── Schedule next update ──
        self._update_job = self.root.after(UPDATE_DELAY, self._update_frame)

    # ==================================================================
    # Internal helpers
    # ==================================================================

    def _stop_current_source(self) -> None:
        """Safely tear down the active VideoSource."""
        if self._update_job is not None:
            self.root.after_cancel(self._update_job)
            self._update_job = None

        if self.video_source is not None:
            self.video_source.stop()
            self.video_source = None

        self.source_mode = "none"
        self._btn_webcam.config(state=tk.NORMAL)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    root = tk.Tk()
    root.geometry(f"{CANVAS_W + 260}x{CANVAS_H + 24}")
    root.minsize(720, 480)
    app = SignSenseApp(root)
    root.protocol("WM_DELETE_WINDOW", app._on_exit)
    root.mainloop()


if __name__ == "__main__":
    main()
