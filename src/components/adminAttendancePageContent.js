import { AdminContext } from "../pages/adminPage";
import { useContext, useEffect, useState } from "react";
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
            consumeStudent={consumeStudent}
            forceStop={forceStop}
          />
        ))}
      </div>
    </div>
  );
};