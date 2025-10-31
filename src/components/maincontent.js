import "./top.css";
import avatar1 from "./img/Avatart1.jpg";
import { Option } from "./option";
import { CameraComponent } from "./lifefeed";
import { Bottom } from "./subbottom";
import { Easynavigator } from "./Navtab";
import { useContext, useMemo, useState, useEffect } from "react";
import { ExamContext } from "../pages/examPage";
import { useNavigate } from "react-router-dom";
import { submitExamAnswers } from "../api/examSubmit";
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
  const { hr, min, sec } = useMemo(() => {
    const hr = Math.floor(timeLeft / 3600);
    const min = Math.floor((timeLeft % 3600) / 60);
    const sec = timeLeft % 60;
    return { hr, min, sec };
  }, [timeLeft]);
  useEffect(() => {
      if (isPaused) return; // ⏸️ freeze timer when paused
    if (!timeLeft || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit("Time expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted,isPaused]);
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
    const handleBeforeUnload = (event) => {
      if (!isSubmitted) {
        handleSubmit("Page reload or tab closed");
        // Prevents browser from closing immediately
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave? Your exam will be submitted.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitted]);

  const handleSubmit = () => {
    try{
      submitExamAnswers(regNo,currentExam, answers);
    if (window.__stopCamera) window.__stopCamera();
    clearInterval(); // stop timer (optional)
    navigate("/");
    if (isSubmitted) return;
    setIsSubmitted(true);      
    }catch(e){
      alert(e.message);
      console.error("Error during exam submission:", e);
       setIsPaused(true); 
    }
    //navigate("/result"); // or wherever you want to go
  };
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
  const number = examQuestions.findIndex((q) => q.id === question.id);
  const answer = answers.find((it) => it.questionId === question.id)?.answerChoosen ?? null;
  useEffect(() => {
    const blockShortcuts = (e) => {
      if (
        e.ctrlKey ||
        e.key === "F12" ||
        e.key === "Tab" ||
        (e.metaKey && e.key.toLowerCase() === "r") // Cmd+R (Mac)
      ) {
        e.preventDefault();
        alert("This action is disabled during the exam.");
      }
    };
    window.addEventListener("keydown", blockShortcuts);
    return () => window.removeEventListener("keydown", blockShortcuts);
  }, []);

  // 🚨 Auto-submit if user leaves tab, minimizes, or switches app
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
              src={avatar1}
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
