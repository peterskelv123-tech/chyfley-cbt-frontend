import { useEffect, useRef } from "react";
export function useExamLifecycle({
  isPaused,
  isSubmitted,
  timeLeft,
  setTimeLeft,
  handleSubmitRef, // pass the ref from component
  socket,
  regNo,
  currentExam,
  subject,
  className,
  answersRef,
}) {
  // Internal camera cleanup or lock can remain here if needed
  // submitLock is now managed in the component

  //----------------------------------------------
  // CAMERA CLEANUP
  //----------------------------------------------
  const timerRef = useRef(null);
  useEffect(() => {
    return () => {
      console.log("CAMERA STOPPED FROM CLEANUP");
      if (window.__stopCamera) {
        try {
          window.__stopCamera();
        } catch (err) {
          console.warn("Error stopping camera:", err);
        }
      }
      console.log("Main rendered, isSubmitted =", isSubmitted);
    };
  }, []);

  //----------------------------------------------
  // TIMER
  //----------------------------------------------
  useEffect(() => {
    if (isPaused || isSubmitted || timerRef.current) return;
    console.log("time left is:", timeLeft)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleSubmitRef.current?.("Time expired");
          return 0;
        }

        const updated = prev - 1;
        socket.emit("student-status", {
          studentId: regNo,
          examId: currentExam,
          subject,
          className,
          timeLeft: updated,
          answered: answersRef.current?.length ?? 0,
          active: true
          // ✅ use ref
        });

        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, isSubmitted, regNo, currentExam, socket]); // ✅ removed answers.length


  //----------------------------------------------
  // VISIBILITY + BLUR + UNLOAD AUTO-SUBMIT
  //----------------------------------------------
  useEffect(() => {
    if (isPaused) return;

    let blurTimeout = null;
    const TIMEOUT = 1000; // 15 seconds

    const handleVisibility = () => {
      if (document.hidden && !isSubmitted) {
        blurTimeout = setTimeout(() => {
          handleSubmitRef.current && handleSubmitRef.current("Tab switched / minimized");
        }, TIMEOUT);
      } else {
        clearTimeout(blurTimeout);
      }
    };

    const handleBlur = () => {
      if (!isSubmitted) {
        blurTimeout = setTimeout(() => {
          if (!document.hidden) {
            handleSubmitRef.current && handleSubmitRef.current("Window unfocused");
          }
        }, TIMEOUT);
      }
    };

    const handleFocus = () => clearTimeout(blurTimeout);

    const handleUnload = (e) => {
      if (!isSubmitted) {
        handleSubmitRef.current && handleSubmitRef.current("Page closed or refreshed");
        e.preventDefault();
        e.returnValue = "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleUnload);
      clearTimeout(blurTimeout);
    };
  }, [isSubmitted, isPaused]);

  //----------------------------------------------
  // SOCKET LIFECYCLE + SHORTCUTS
  //----------------------------------------------
  useEffect(() => {
    if (!regNo || !currentExam) {
      console.log("⛔ regNo or currentExam not ready yet.");
      return;
    }

    const joinPayload = { studentId: regNo, examId: currentExam, timeLeft };

    const forceStopHandler = (data) => {
      console.log("RECEIVED STOP:", data);
      if (data.studentId === regNo) handleSubmitRef.current && handleSubmitRef.current("Stopped by admin");
    };

    const onConnect = () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("student-join", joinPayload, (ack) => {
        console.log("✅ JOIN ACK:", ack);
      });
    };

    socket.on("force-stop", forceStopHandler);
    socket.on("connect", onConnect);

    const blockShortcuts = (e) => {
      if (
        e.ctrlKey ||
        e.key === "F12" ||
        e.key === "Tab" ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        alert("Disabled during exam");
        handleSubmitRef.current && handleSubmitRef.current("Forbidden key");
      }
    };

    window.addEventListener("keydown", blockShortcuts);

    return () => {
      socket.off("connect", onConnect);
      socket.off("force-stop", forceStopHandler);
      window.removeEventListener("keydown", blockShortcuts);
    };
  }, [regNo, currentExam, timeLeft, socket]);
}
