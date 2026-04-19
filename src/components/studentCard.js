import { useEffect, useRef, useState } from "react";

export const StudentCard = ({
  student,
  forceStop,
  registerMediaRefs,
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);

  const [noiseLevel, setNoiseLevel] = useState(0);

  // -----------------------------
  // Register media refs (ONCE, clean)
  // -----------------------------
  useEffect(() => {
    const id = setTimeout(() => {
      if (!videoRef.current || !audioRef.current) return;

      registerMediaRefs(student.studentId, {
        videoEl: videoRef.current,
        audioEl: audioRef.current,
      });
    }, 0);

    return () => clearTimeout(id);
  }, [student.studentId, registerMediaRefs]);
  // -----------------------------
  // Noise analyzer
  // -----------------------------
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !audioEl.srcObject) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;

    const source = ctx.createMediaStreamSource(audioEl.srcObject);
    source.connect(analyser);

    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      setNoiseLevel(rms);

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        analyser.disconnect();
      } catch { }
    };
  }, [audioRef.current?.srcObject]);

  const noisePercent = Math.min(noiseLevel * 300, 100);

  return (
    <div
      className="p-3 mb-3 bg-light"
      style={{ border: "1px solid #51c225", borderRadius: 10 }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: 200,
          background: "#000",
        }}
      />

      <audio ref={audioRef} muted />

      {/* Noise Indicator */}
      <div className="mt-2">
        <strong>Noise Level</strong>
        <div
          style={{
            height: 8,
            background: "#ddd",
            borderRadius: 4,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${noisePercent}%`,
              background:
                noisePercent > 40 ? "#dc3545" : "#28a745",
              borderRadius: 4,
              transition: "width 80ms linear",
            }}
          />
        </div>
      </div>

      <div className="mt-2">
        <strong>Full Name:</strong> {student.studentId}
      </div>
      <div className="mt-2">
        <strong>Subject:</strong> {student.subject}
      </div>
      <div className="mt-2">
        <strong>Class:</strong> {student.className}
      </div>
      <div className="mt-2">
        <strong>Answered Question:</strong> {student.answered}
      </div>
      <div className="mt-2">
        <strong>Time Left:</strong> {student.timeLeft} secs
      </div>

      <button
        className="btn btn-danger mt-2"
        onClick={() => forceStop(student.studentId)}
      >
        Force Stop
      </button>
    </div>
  );
};