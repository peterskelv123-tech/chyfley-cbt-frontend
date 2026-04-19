import { useState, useRef, useEffect, createContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchUserProgress } from "../api/baseAxious";
import { fetchExamQuestions } from "../api/baseAxious";
import { createSocket } from "../api/socket";
import { Welcome, Main } from "../components"
export const ExamContext = createContext();
export const ExamPage = () => {
  const exams = useSelector((state) => state.items.exams);
  //console.log(exams)
  const [currentExam, setCurrentExam] = useState(exams[0]?.id ?? 0);
  const regno = useSelector((state) => state.items.regNo);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const s = createSocket({ studentId: regno });

    socketRef.current = s;
    setSocket(s); // ✅ triggers re-render when ready

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [regno]);
  const [question, setQuestion] = useState(null);
  const [table, setTable] = useState([]);
  const [tabledisplay, setTabledisplay] = useState(false);
  const navigate = useNavigate();
  const saveProgressMutation = useMutation({
    mutationFn: (updated) => api.post("/redis/student-progress", updated),
    onMutate: (variables) => {
      console.log("About to save progress:", variables);
    },
    onSuccess: (data, variables) => {
      console.log("Progress saved successfully for:", variables, "Response:", data);
    },
    onError: (error, variables) => {
      console.error("Failed to save progress for:", variables, "Error:", error);
    },
  });
  useEffect(() => {
    if (exams && exams.length <= 0) {
      navigate("/", { replace: true });
    }
  }, [exams, navigate])
  const queryClient = useQueryClient()
  // Fetch exam questions using React Query v5
  const { data: examQuestions, isLoading, error } = useQuery({
    queryKey: ["examQuestions", currentExam],
    queryFn: () => fetchExamQuestions(currentExam, regno),
    enabled: Boolean(currentExam && exams.length > 0),
  });
  const progressQuery = useQuery({
    queryKey: ['progress', currentExam, regno],
    queryFn: () => fetchUserProgress(currentExam, regno),
    enabled: Boolean(currentExam && exams.length > 0),
  });
  const {
    answers = [],
    currentIndex = 0,
    questionMeta = [],
  } = progressQuery.data || {};
  const { timeAllocated, subject, className, type } = useMemo(() => {
    const selectedExam = exams.find((exam) => exam.id === currentExam);

    if (!selectedExam) {
      return {
        timeAllocated: 0,
        subject: "",
        className: "",
        type: "",
      };
    }
    return {
      timeAllocated: selectedExam.hasStarted
        ? Math.max(0, selectedExam.remainingSeconds)
        : selectedExam.durationSeconds
      ,
      subject: selectedExam.subject,
      className: selectedExam.class,
      type: selectedExam.type,
    };
  }, [currentExam, exams, progressQuery.data]);
  useEffect(() => {
    if (!socket || !currentExam) return;

    socket.emit(
      "student:join",
      { roomId: String(currentExam) },
      async ({ rtpCapabilities }) => {
        console.log("Joined room, RTP caps:", rtpCapabilities);
        // Store for later (device creation)
        window.__rtpCapabilities = rtpCapabilities;
      }
    );

    //console.log("Socket initialized for exam:", currentExam);
    return () => {
      socket.off("join-room");
    };
  }, [socket, currentExam]);

  // Generate question table & set first question
  useEffect(() => {
    if (!examQuestions || examQuestions.length === 0) return;

    const cols = 10;
    let gentable;

    if (examQuestions.length <= cols) {
      // Less than or equal to 10 questions -> single row
      gentable = [Array.from({ length: examQuestions.length }, (_, i) => i + 1)];
    } else {
      // More than 10 questions -> multiple rows
      const rows = Math.ceil(examQuestions.length / cols);
      gentable = Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) => {
          const number = rowIndex * cols + colIndex + 1;
          return number <= examQuestions.length ? number : null;
        }).filter((n) => n !== null) // remove nulls for last row
      );
    }

    setTable(gentable);
    setQuestion(examQuestions[currentIndex]);
  }, [examQuestions, currentIndex]);

  const displayNavBar = () => {
    setTabledisplay(!tabledisplay);
  };

  const changeQuestion = (event) => {
    if (!examQuestions || !question) return;

    const text = event.target.innerText.trim();
    let currentIdx = examQuestions.findIndex(q => q.id === question.id);
    let newIndex = currentIdx;

    // 🔹 Numeric navigation
    if (!isNaN(text)) {
      const n = parseInt(text);
      if (n >= 1 && n <= examQuestions.length) {
        newIndex = n - 1;
      } else {
        alert(`Question ${n} does not exist.`);
        return;
      }
    }
    // 🔹 Next / Previous
    else {
      const mode = text.toLowerCase();
      if (mode === "next" && currentIdx < examQuestions.length - 1) {
        newIndex = currentIdx + 1;
      } else if (mode === "previous" && currentIdx > 0) {
        newIndex = currentIdx - 1;
      }
      else if (event.key && event.key === "ArrowLeft" && currentIdx > 0) {
        newIndex = currentIdx - 1;
      }
      else if (event.key && event.key === "ArrowRight" && currentIdx < examQuestions.length - 1) {
        newIndex = currentIdx + 1;
      }
    }

    // 🔹 Update UI first
    setQuestion(examQuestions[newIndex]);

    // 🔹 Prepare updated progress
    const prevProgress = queryClient.getQueryData(['progress', currentExam, regno]) || {
      answers: [],
      currentIndex: 0,
      questionMeta: [],
    };

    const visited = newIndex < prevProgress.questionMeta.length;

    const updatedProgress = {
      ...prevProgress,
      currentIndex: newIndex,
      questionMeta: visited
        ? prevProgress.questionMeta
        : examQuestions.slice(0, newIndex + 1),
    };

    // 🔹 Update cache
    queryClient.setQueryData(['progress', currentExam, regno], updatedProgress);

    // 🔹 Trigger mutation (autosave)
    //console.log("Saving progress:", updatedProgress); // ✅ debug log
    saveProgressMutation.mutate({
      studentId: regno,
      examId: currentExam,
      progress: updatedProgress,
    });
  };

  const answerQuestion = (answer) => {
    // Get the previous progress, or initialize if undefined
    const prevProgress = queryClient.getQueryData(['progress', currentExam, regno]) || {
      answers: [],
      currentIndex: 0,
      questionMeta: [],
    };

    // Update or insert the answer for the current question
    const updatedAnswers = [...(prevProgress.answers ?? [])];
    const idx = updatedAnswers.findIndex(item => item.questionId === question.id);

    if (idx >= 0) {
      updatedAnswers[idx] = {
        ...updatedAnswers[idx],
        answerText: updatedAnswers[idx].answerText !== answer ? answer : null,
      };
    } else {
      updatedAnswers.push({
        questionId: question.id,
        answerText: answer,
      });
    }

    // Prepare the updated progress
    const updatedProgress = {
      ...prevProgress,
      answers: updatedAnswers,
    };

    // Update cache
    queryClient.setQueryData(['progress', currentExam, regno], updatedProgress);

    // Trigger mutation (autosave) and log for debugging
    //console.log("Saving answers progress:", updatedProgress);
    saveProgressMutation.mutate({
      studentId: regno,
      examId: currentExam,
      progress: updatedProgress,
    });
  };
  //console.log("time sent to main:", timeAllocated);
  // ADD THIS JUST BEFORE return (...) IN ExamPage

  if (!currentExam || !exams || exams.length === 0) {
    return null;
  }

  return (
    <div className="All">
      {isLoading && <div>Loading exam questions...</div>}
      {error && <div>Error loading exam questions: {error.message}</div>}
      {!isLoading && !error && question && (
        <ExamContext.Provider value={{
          exams,
          currentExam,
          setCurrentExam,
          question,
          examQuestions,
          answers,
          changeQuestion,
          answerQuestion,
          tabledisplay,
          displayNavBar,
          table,
          socket,
          subject,
          className
        }}  >
          <Welcome />
          {!progressQuery.isLoading && <Main
            regNo={regno}
            Exam={type}
            Subject={subject}
            userClass={className}
            time={parseInt(timeAllocated)}
          />}
        </ExamContext.Provider>
      )}
    </div>
  );
};
