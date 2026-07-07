"use client";

import { useEffect, useRef } from "react";

export default function HandTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLabel = useRef("A");
  const latestData = useRef<number[]>([]);

  useEffect(() => {
    let handLandmarker: any;
    let animationFrameId: number;

    // 🎯 KEYBOARD LISTENER (ONLY ONCE)
    const handleKey = async (e: KeyboardEvent) => {
      console.log("Key pressed:", e.key);

      // set label
      if (/^[a-zA-Z]$/.test(e.key)) {
        currentLabel.current = e.key.toUpperCase();
        console.log("Label set:", currentLabel.current);
      }

      // save on SPACE
      if (e.code === "Space") {
        console.log("SPACE pressed");

        const sample = {
          label: currentLabel.current,
          data: latestData.current,
        };

        try {
          const res = await fetch("/api/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sample),
          });

          const result = await res.json();
          console.log("Saved ✅", result);
        } catch (err) {
          console.error("Save error ❌", err);
        }
      }
    };

    window.addEventListener("keydown", handleKey);

    // CAMERA
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };

    // MODEL
    const loadModel = async () => {
      const vision = await import("@mediapipe/tasks-vision");

      const filesetResolver =
        await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

      handLandmarker = await vision.HandLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }
      );

      console.log("Model loaded ✅");
    };

    // DETECTION
    const detectHands = () => {
      if (!videoRef.current || !canvasRef.current || !handLandmarker) {
        animationFrameId = requestAnimationFrame(detectHands);
        return;
      }

      if (videoRef.current.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectHands);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const results = handLandmarker.detectForVideo(
        videoRef.current,
        performance.now()
      );

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const data = results.landmarks
          .flat()
          .map((p: any) => [p.x, p.y, p.z])
          .flat();

        latestData.current = data; // 👈 store latest data

        console.log(data);

        // draw
        results.landmarks.forEach((landmarks: any) => {
          landmarks.forEach((point: any) => {
            ctx?.beginPath();
            ctx?.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              5,
              0,
              2 * Math.PI
            );
            if (ctx) {
              ctx.fillStyle = "red";
              ctx.fill();
            }
          });
        });
      }

      animationFrameId = requestAnimationFrame(detectHands);
    };

    const init = async () => {
      await setupCamera();
      await loadModel();
      detectHands();
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Hand Detection Test</h1>
      <div className="relative">
        <video ref={videoRef} className="w-[640px] h-[480px]" />
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>
    </div>
  );
}