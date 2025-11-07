import "./top.css";
//import avatar1 from "./img/Avatart1.jpg";
import { Option } from "./option";
import { CameraComponent } from "./lifefeed";
import { Bottom } from "./subbottom";
import { Easynavigator } from "./Navtab";
import { useContext, useMemo, useState, useEffect } from "react";
import { ExamContext } from "../pages/examPage";
import { useNavigate } from "react-router-dom";
import { submitExamAnswers } from "../api/examSubmit";
import { socket } from "../api/socket";
export const Main = ({
  regNo,
  userClass,
  Exam,
  Subject,
  time
}) => {
  //const answer =answers.find((it) => it.questionId === question.id)?.answerChoosen ?? null;
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState((time || 0) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const {
    question,
    examQuestions,
    answers,
    changeQuestion,
    answerQuestion,
    tabledisplay,
    displayNavBar,
    table,
    currentExam
  } = useContext(ExamContext)
  const { hr, min, sec } = useMemo(() => {
    const hr = Math.floor(timeLeft / 3600);
    const min = Math.floor((timeLeft % 3600) / 60);
    const sec = timeLeft % 60;
    return { hr, min, sec };
  }, [timeLeft]);
  const handleSubmit = (reason = "Submitted") => {
    try {
      console.log("Submit reason:", reason);

      submitExamAnswers(regNo, currentExam, answers);

      if (window.__stopCamera) window.__stopCamera();

      if (!isSubmitted) setIsSubmitted(true);

      navigate("/");
    } catch (e) {
      alert(e.message);
      console.error("Error during exam submission:", e);
      setIsPaused(true);
    }
  };

  // ✅ TIMER
  useEffect(() => {
    if (isPaused || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit("Time expired");
          return 0;
        }

        const updatedTime = prev - 1;

        socket.emit("student-status", {
          studentId: regNo,
          examId: currentExam,
          timeLeft: updatedTime,
          answered: answers.length,
        });

        return updatedTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isSubmitted, answers.length]);
  // ✅ ANTI-TAB CHANGE (ONLY ONCE)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !isSubmitted) {
        handleSubmit("You left the exam tab");
      }
    };

    const handleBlur = () => {
      if (!document.hidden && !isSubmitted) {
        handleSubmit("You switched tabs or apps");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isSubmitted]);
  useEffect(() => {
    socket.emit("student-join", {
      studentId: regNo,
      examId: currentExam,
      timeLeft
    });

    const forceStopHandler = (data) => {
      if (data.examId === currentExam) {
        alert("Your exam has been stopped by the administrator.");
        handleSubmit("Stopped by admin");
      }
    };

    socket.on("force-stop-exam", forceStopHandler);

    const blockShortcuts = (e) => {
      if (
        e.ctrlKey ||
        e.key === "F12" ||
        e.key === "Tab" ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        alert("This action is disabled during the exam.");
      }
    };

    window.addEventListener("keydown", blockShortcuts);

    return () => {
      window.removeEventListener("keydown", blockShortcuts);
      socket.off("force-stop-exam", forceStopHandler);
    };
  }, []);
  const number = examQuestions.findIndex((q) => q.id === question.id);
  const answer = answers.find((it) => it.questionId === question.id)?.answerChoosen ?? null;
  return (
    <div className="container-fluid">
      <div className="row">
        <div
          className="col-md-2"
          style={{
            borderRight: "0.5px solid gray",
            borderBottom: "0.5px solid gray",
            minHeight: "88vh",
          }}
        >
          <button className="btn btn-light greenborder text-lemon">
            <i className="fas fa-list" style={{ marginRight: "15px" }}></i>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              Dashboard
            </span>
          </button>
          <button className="btn btn-light greenborder text-lemon">
            <i className="fas fa-book" style={{ marginRight: "15px" }}></i>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              Subjects
            </span>
          </button>
          <button className="btn btn-light greenborder text-light bg-lemon">
            <i className="fas fa-tv" style={{ marginRight: "15px" }}></i>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              Exam
            </span>
          </button>
          <button className="btn btn-light greenborder text-lemon">
            <i className="far fa-user" style={{ marginRight: "15px" }}></i>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              User Info
            </span>
          </button>
          <div className="user bg-lemon text-light">
            <img
              src={"/img/Avatart1.jpg"}
              alt="it should show an avatar"
              height="50%"
              width="50%"
              style={{
                alignSelf: "center",
                borderRadius: "50%",
                border: "2.5px solid white",
              }}
              className="mt-3"
            />
            <div style={{ fontWeight: "bolder" }}>{regNo}</div>
            <div style={{ marginBottom: "15px" }}>{userClass}</div>
          </div>
        </div>
        <div className="col-md-10">
          <div
            className="container text-lemon mt-3"
            style={{ fontWeight: "bolder" }}
          >
            <span>{Exam}/{Subject}</span>
            <span style={{ marginLeft: "80%" }}>{hr}:{min}:{sec}</span>
          </div>
          <div
            className="container"
            style={{
              height: "80vh",
              border: "0.5px solid rgb(81, 194, 37)",
              borderRadius: "8px",
            }}
          >
            <div className="container-fluid">
              <div className="row">
                <div
                  className="col-md-8"
                  style={{
                    height: "80vh",
                    borderRight: "1px solid rgb(81, 194, 37)",
                    position: "relative", // Ensure proper positioning of the Bottom component
                  }}
                >
                  {/* Question content */}
                  <div className="text-dark" style={{ fontWeight: "bolder" }}>
                    {" "}
                    {"Question " + (number + 1)}
                  </div>
                  <div>{question.question}</div>
                  <Option
                    options={question.options}
                    no={number}
                    save={answerQuestion}
                    answer={answer}
                  />
                  <Easynavigator
                    num={number}
                    show={tabledisplay}
                    answered={answers}
                    action={changeQuestion}
                    table={table}
                    examQuestions={examQuestions}
                  />
                  {/* Bottom component */}
                  <Bottom
                    number={number}
                    action={changeQuestion}
                    ctrl={displayNavBar}
                    totalQuestions={examQuestions.length}
                  />
                </div>
                <div className="col-md-4 d-flex flex-column align-items-center justify-content-start">
                  {/* Camera at the top */}
                  <div className="mt-3 mb-2">
                    <CameraComponent />
                  </div>

                  {/* Spacer pushes the button down */}
                  <div className="flex-grow-1"></div>

                  {/* Submit Button */}
                  <button
                    className="btn btn-success mb-4"
                    style={{
                      backgroundColor: "rgb(81, 194, 37)",
                      borderColor: "rgb(81, 194, 37)",
                      fontWeight: "bold",
                      color: "white",
                      width: "150px",
                      borderRadius: "8px",
                    }}
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
