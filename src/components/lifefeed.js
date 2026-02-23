import { useEffect, useRef } from "react";

export const CameraComponent = ({ onCameraStreamCallback }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
  console.log("Camera component mounted");
}, []);
  useEffect(() => {
    const constraints = { video: { facingMode: "user" }, audio: true };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const hardFail = (reason) => {
      console.error("🚨 Camera hard fail:", reason);
      alert("Camera and microphone access are required to take this exam.");
      window.location.replace("/login");
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!stream || !stream.getVideoTracks().length || !stream.getAudioTracks().length) {
          throw new Error("Missing video or audio track");
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        if (typeof onCameraStreamCallback === "function") {
          console.log("Camera stream obtained, invoking callback");
          onCameraStreamCallback(stream); // send stream to mediasoup producer
        }
      } catch (err) {
        hardFail(err);
      }
    };

    startCamera();
    return () => stopCamera();
  }, [onCameraStreamCallback]);

  return (
    <div className="mt-3 d-flex justify-content-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "70%",
          maxWidth: "420px",
          transform: "scaleX(-1)",
          borderRadius: "10px",
          border: "1px solid rgb(81, 194, 37)",
        }}
      />
    </div>
  );
};