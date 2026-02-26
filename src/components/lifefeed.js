import { useEffect, useRef } from "react";

export const CameraComponent = ({ onCameraStreamCallback }) => {
  const videoRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    console.log("📷 Camera component mounted");

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("🎥 Camera stream obtained");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // ✅ CORRECT CALLBACK
        onCameraStreamCallback?.(stream);
      } catch (err) {
        console.error("❌ Failed to get camera stream", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, [onCameraStreamCallback]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ width: "100%", height: "100%", background: "black" }}
    />
  );
};