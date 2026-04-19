import { AdminContext } from "../pages/adminPage";
import { useContext, useEffect, useState, useRef } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMediasoupAdmin } from "../customHookes/useMediaSoupConsumer";
import { StudentCard } from "./studentCard";
export const AdminAttendancePage = () => {
  const { socket } = useContext(AdminContext);
  const queryClient = useQueryClient();
  const { consumeStudent } = useMediasoupAdmin(socket);
  const [allowAudio, setAllowAudio] = useState(false);
  // ----------------------------
  // Attendance snapshot
  // ----------------------------
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => queryClient.getQueryData(["attendance"]) || [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });
  const mediaRefs = useRef(new Map());
  const pendingProducers = useRef(new Map());

  const registerMediaRefs = (studentId, refs) => {
    mediaRefs.current.set(studentId, refs);

    // 🔥 CHECK pending producers
    const pending = pendingProducers.current.get(studentId);

    if (pending && pending.length > 0) {
      console.log("🚀 Flushing buffered producers for", studentId);

      pending.forEach(({ producerId, kind }) => {
        consumeStudent(studentId, producerId, refs.videoEl, refs.audioEl);
      });

      pendingProducers.current.delete(studentId);
    }
  };
  useEffect(() => {
    if (!socket) return;

    const handleNewProducer = ({ studentId, producerId, kind }) => {
      const refs = mediaRefs.current.get(studentId);

      if (!refs) {
        console.log("⏳ Buffering producer for", studentId);

        if (!pendingProducers.current.has(studentId)) {
          pendingProducers.current.set(studentId, []);
        }

        pendingProducers.current.get(studentId).push({
          producerId,
          kind,
        });
        return;
      }

      consumeStudent(studentId, producerId, refs.videoEl, refs.audioEl);
    };

    socket.on("new-student-producer", handleNewProducer);

    return () => {
      socket.off("new-student-producer", handleNewProducer);
    };
  }, [socket, consumeStudent]);
  // ----------------------------
  // Listen for student stopped
  // ----------------------------
  useEffect(() => {
    if (!socket) return;

    const handleStudentStopped = ({ studentId }) => {
      queryClient.setQueryData(["attendance"], (prev = []) =>
        prev.filter((s) => s.studentId !== studentId)
      );
    };

    socket.on("student-stopped", handleStudentStopped);
    return () => socket.off("student-stopped", handleStudentStopped);
  }, [socket, queryClient]);

  // ----------------------------
  // Force stop exam
  // ----------------------------
  const forceStop = (studentId) => {
    if (!socket) return;

    const allAttendance =
      queryClient.getQueryData(["attendance"]) || [];

    const studentRecord = allAttendance.find(
      (r) => r.studentId === studentId
    );

    if (!studentRecord) return;

    socket.emit("admin-stop-exam", {
      studentId,
      examId: studentRecord.examId,
    });
  };



  return (
    <div className="p-4">
      <h3 className="mb-3">Live Attendance Overview</h3>

      {/* 🔊 Enable audio */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setAllowAudio(!allowAudio);
          document.querySelectorAll("audio").forEach((a) => {
            a.muted = allowAudio;
            a.play().catch(() => { });
          });
        }}
      >
        {allowAudio ? "Disable Audio" : "Enable Audio"} 🔊
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {attendance.map((student) => (
          <StudentCard
            key={student.studentId}
            student={student}
            registerMediaRefs={registerMediaRefs}
            forceStop={forceStop}
          />
        ))}
      </div>
    </div>
  );
};