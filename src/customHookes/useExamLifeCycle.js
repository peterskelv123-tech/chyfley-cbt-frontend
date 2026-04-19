import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// Custom hook to handle the student exam lifecycle
export function useExamLifecycle({
  isPaused,
  isSubmitted,
  timeLeft,
  setTimeLeft,
  handleSubmitRef, // ref to student's submit function
  socket,
  regNo,
  currentExam,
  subject,
  className,
  answersRef,
  stopStreaming, // from useStudentMediaStream
}) {
  const timerRef = useRef(null);
  const navigate = useNavigate();

  //----------------------------------------------
  // TIMER: decrement every second and send status
  //----------------------------------------------
  useEffect(() => {
    if (isPaused || isSubmitted || timerRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleSubmitRef.current?.("Time expired");
          return 0;
        }

        const updated = prev - 1;

        socket?.emit("student-status", {
          studentId: regNo,
          examId: currentExam,
          subject,
          className,
          timeLeft: updated,
          answered: answersRef.current?.length ?? 0,
          active: true,
        });

        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isPaused, isSubmitted, regNo, currentExam, socket]);

  //----------------------------------------------
  // FORCE-STOP: triggered by admin
  //----------------------------------------------
  useEffect(() => {
    if (!socket || !regNo) return;

    const forceStopHandler = (data) => {
      if (data.studentId === regNo) {
        console.log("⚠️ Force-stop received from admin");

        // Stop camera/audio immediately
        stopStreaming?.();

        // Submit exam immediately
        handleSubmitRef.current?.("Stopped by admin");

        // Optional: Disable buttons/UI here if needed

        // Notify student visually
        toast.error("Your exam has been stopped by the admin!", { duration: 4000 });
      }
    };

    socket.on("force-stop", forceStopHandler);

    return () => {
      socket.off("force-stop", forceStopHandler);
    };
  }, [socket, regNo, stopStreaming, handleSubmitRef]);

  //----------------------------------------------
  // SOCKET JOIN / RECONNECT
  //----------------------------------------------
  useEffect(() => {
    if (!socket || !regNo || !currentExam) return;

    const joinPayload = { studentId: regNo, examId: currentExam, timeLeft };

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("student-join", joinPayload, (ack) => {
        console.log("✅ JOIN ACK:", ack);
      });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [socket, regNo, currentExam, timeLeft]);

  //----------------------------------------------
  // BLOCK FORBIDDEN SHORTCUTS
  //----------------------------------------------
  useEffect(() => {
    const blockShortcuts = (e) => {
      if (
        e.ctrlKey ||
        e.key === "F12" ||
        e.key === "Tab" ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        handleSubmitRef.current?.("Forbidden key pressed");
        toast.error("Shortcut disabled during exam!", { duration: 4000 });
      }
    };

    window.addEventListener("keydown", blockShortcuts);
    return () => window.removeEventListener("keydown", blockShortcuts);
  }, []);

  //----------------------------------------------
  // VISIBILITY + BLUR + UNLOAD AUTO-SUBMIT
  //----------------------------------------------
  useEffect(() => {
    if (isPaused) return;

    let blurTimeout = null;
    const TIMEOUT = 1000; // 1 second for testing; increase as needed

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        blurTimeout = setTimeout(() => {
          handleSubmitRef.current?.("Tab switched / minimized");
        }, TIMEOUT);
      } else {
        clearTimeout(blurTimeout);
      }
    };

    const handleBlur = () => {
      if (!isSubmitted) {
        blurTimeout = setTimeout(() => {
          handleSubmitRef.current?.("Window unfocused");
        }, TIMEOUT);
      }
    };

    const handleFocus = () => clearTimeout(blurTimeout);

    const handleUnload = (e) => {
      if (!isSubmitted) {
        handleSubmitRef.current?.("Page closed or refreshed");
        stopStreaming?.();
        e.preventDefault();
        e.returnValue = "";
        navigate("/", { replace: true });
      }
    };

    /*document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleUnload);*/

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleUnload);
      clearTimeout(blurTimeout);
    };
  }, [isSubmitted, isPaused, stopStreaming, navigate]);
}
