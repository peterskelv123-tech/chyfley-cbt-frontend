import { useRef, useEffect } from "react";

export const CameraComponent = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const constraints = { video: true };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    // ✅ stop camera function (used both on cleanup & externally)
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log("🎥 Camera stopped");
      }
    };

    // ✅ make stop function globally accessible
    window.__stopCamera = stopCamera;

    // ✅ cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="mt-3">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "70%",
          maxWidth: "500px",
          marginLeft: "4rem",
          transform: "scaleX(-1)",
          borderRadius: "10px",
          border: "1px solid rgb(81, 194, 37)",
        }}
      />
    </div>
  );
};
