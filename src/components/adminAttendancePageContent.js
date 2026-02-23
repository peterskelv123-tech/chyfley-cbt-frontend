import { AdminContext } from "../pages/adminPage";
import { useContext, useEffect, useRef } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMediasoupAdmin } from "../customHookes/useMediaSoupConsumer";

export const AdminAttendancePage = () => {
  const { socket } = useContext(AdminContext);
  const queryClient = useQueryClient();
  const { consumeStudent } = useMediasoupAdmin(socket);

  // ----------------------------
  // Fetch attendance snapshot from queryClient
  // ----------------------------
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => queryClient.getQueryData(["attendance"]) || [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  // ----------------------------
  // Listen for student stopped events
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
  // Force stop student exam
  // ----------------------------
  const forceStop = (studentId) => {
    if (!socket) return;

    const allAttendance = queryClient.getQueryData(["attendance"]) || [];
    const studentRecord = allAttendance.find((r) => r.studentId === studentId);
    if (!studentRecord) return;

    socket.emit("admin-stop-exam", {
      studentId,
      examId: studentRecord.examId,
    });
  };

  // ----------------------------
  // Student Card Component
  // ----------------------------
  const StudentCard = ({ student }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
      if (
        socket &&
        student.producerId &&
        student.transport &&
        (videoRef.current || audioRef.current)
      ) {
        consumeStudent(
          student.studentId,
          student.producerId,
          student.transport,
          videoRef.current,
          audioRef.current
        );
      }
    }, [socket, student.producerId, student.transport]);

    return (
      <div
        className="p-3 mb-3"
        style={{
          border: "1px solid #51c225",
          borderRadius: "10px",
          width: "250px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          style={{
            width: "100%",
            height: "150px",
            borderRadius: "8px",
            backgroundColor: "#000",
          }}
        />
        <audio ref={audioRef} autoPlay />

        <div style={{ marginTop: "10px" }}>
          <div>
            <strong>ID:</strong> {student.studentId}
          </div>
          <div>
            <strong>Subject:</strong> {student.subject}
          </div>
          <div>
            <strong>Class:</strong> {student.className}
          </div>
          <div>
            <strong>Answered:</strong> {student.answered ?? 0}
          </div>
          <div>
            <strong>Time Left:</strong> {student.timeLeft ?? 0} mins
          </div>
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

  return (
    <div className="p-4">
      <h3 className="mb-3">Live Attendance Overview</h3>

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          document.querySelectorAll("audio").forEach((a) => {
            a.muted = false;
            a.play().catch(() => {});
          });
        }}
      >
        Enable Audio 🔊
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {attendance.map((student) => (
          <StudentCard key={student.studentId} student={student} />
        ))}
      </div>
    </div>
  );
};