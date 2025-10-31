import { useState, useEffect, createContext, useMemo, } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchExamQuestions } from "../api/baseAxious";
import { Welcome, Main } from "../components"
export const ExamContext = createContext();
export const ExamPage = () => {
  const exams = useSelector((state) => state.items.exams);
  const [currentExam, setCurrentExam] = useState(exams[0]?.id ?? 0);
  const regno = useSelector((state) => state.items.regNo);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [table, setTable] = useState([]);
  const [tabledisplay, setTabledisplay] = useState(false);

  // Fetch exam questions using React Query v5
  const { data: examQuestions, isLoading, error } = useQuery({
    queryKey: ["examQuestions", currentExam],
    queryFn: () => fetchExamQuestions(currentExam),
    enabled: !!currentExam,
  });
const {  timeAllocated, subject, className, type } = useMemo(() => {
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
    timeAllocated: selectedExam.timeAllocated,
    subject: selectedExam.subject,
    className: selectedExam.class,
    type: selectedExam.type,
  };
}, [currentExam, exams]);

  // Generate question table & set first question
  useEffect(() => {
    if (!examQuestions || examQuestions.length === 0) return;
    console.log(currentExam.timeAllocated)
    const cols = 10;
    const rows = Math.ceil(examQuestions.length / cols);
    const gentable = Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: cols }, (_, colIndex) =>
        rowIndex * cols + colIndex + 1
      )
    );

    setTable(gentable);
    setQuestion(examQuestions[0]);
  }, [examQuestions]);

  const displayNavBar = () => {
    setTabledisplay(!tabledisplay);
  };

  const changeQuestion = (event) => {
    if (!examQuestions || !question) return;

    const currentQuestionIndex = examQuestions.findIndex(
      (it) => it.id === question.id
    );

    const controlText = event.target.innerText.trim();

    // Numeric navigation (table click)
    if (!isNaN(controlText)) {
      const num = parseInt(controlText);
      if (num >= 1 && num <= examQuestions.length) {
        setQuestion(examQuestions[num - 1]);
      } else {
        alert(`Question ${num} does not exist.`);
      }
      return;
    }

    // Next / Previous navigation
    const direction = controlText.toLowerCase();
    if (direction === "next" && currentQuestionIndex < examQuestions.length - 1) {
      setQuestion(examQuestions[currentQuestionIndex + 1]);
    } else if (direction === "previous" && currentQuestionIndex > 0) {
      setQuestion(examQuestions[currentQuestionIndex - 1]);
    }
  };

  const answerQuestion = (answer) => {
    if (!question) return;
    setAnswers((prev) => {
      const existing = prev.find((item) => item.questionId === question.id);
      if (existing) {
        // Replace existing answer
        return prev.map((item) =>
          item.questionId === question.id
            ? {
              ...item,
              answerText:
                item.answerText !== answer ? answer : null,
            }
            : item
        );
      } else {
        // Add new answer
        return [...prev, { questionId: question.id, answerText: answer }];
      }
    });
  };

  return (
    <div className="All">
      {isLoading && <div>Loading exam questions...</div>}
      {error && <div>Error loading exam questions: {error.message}</div>}

      {!isLoading && !error && question && (
        <ExamContext.Provider value={{
          currentExam,
          setCurrentExam,
          question,
          examQuestions,
          answers,
          changeQuestion,
          answerQuestion,
          tabledisplay,
          displayNavBar,
          table
        }}  >
          <Welcome />
          <Main
            regNo={regno}
            Exam={type}
            Subject={subject}
            userClass={className}
            time={parseInt(timeAllocated)}
          />
        </ExamContext.Provider>
      )}
    </div>
  );
};
