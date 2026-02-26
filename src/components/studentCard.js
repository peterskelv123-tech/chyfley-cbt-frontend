import { useEffect, useRef, useState } from "react";
export const StudentCard = ({ student, consumeStudent, forceStop }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const [noiseLevel, setNoiseLevel] = useState(0);

  useEffect(() => {
    if (!consumeStudent) return;
    if (!videoRef.current || !audioRef.current) return;

    if (student.producers?.video) {
      consumeStudent(
        student.studentId,
        student.producers.video,
        videoRef.current,
        audioRef.current
      );
    }

    if (student.producers?.audio) {
      consumeStudent(
        student.studentId,
        student.producers.audio,
        videoRef.current,
        audioRef.current
      );
    }
  }, [
    student.studentId,
    student.producers?.video,
    student.producers?.audio,
    consumeStudent,
  ]);
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !audioEl.srcObject) return;

    // Create AudioContext once
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

      // RMS calculation (how "loud" it is)
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
      analyser.disconnect();
    };
  }, [audioRef.current?.srcObject]);
  const noisePercent = Math.min(noiseLevel * 300, 100);
  return (
    <div className="p-3 mb-3 bg-light" style={{ border: "1px solid #51c225", borderRadius: 10 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: 200, background: "#000" }}
      />

      {/* 🔇 Silent audio element */}
      <audio ref={audioRef} muted />

      {/* 🔊 Noise Indicator */}
      <div className="mt-2">
        <strong>Noise Level</strong>
        <div style={{ height: 8, background: "#ddd", borderRadius: 4 }}>
          <div
            style={{
              height: "100%",
              width: `${noisePercent}%`,
              background: noisePercent > 40 ? "#dc3545" : "#28a745",
              borderRadius: 4,
              transition: "width 80ms linear",
            }}
          />
        </div>
      </div>

      <div className="mt-2"><strong>Full Name:</strong> {student.studentId}</div>
      <div className="mt-2"><strong>Subject:</strong> {student.subject}</div>
      <div className="mt-2"><strong>Class:</strong> {student.className}</div>
      <div className="mt-2"><strong>Answered Question:</strong> {student.answered}</div>
      <div className="mt-2"><strong>Time Left:</strong> {student.timeLeft} secs</div>
      <button
        className="btn btn-danger mt-2"
        onClick={() => forceStop(student.studentId)}
      >
        Force Stop
      </button>
    </div>
  );
};