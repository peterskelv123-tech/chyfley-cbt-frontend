import "./top.css";
//import avatar1 from "./img/Avatart1.jpg";
import { Option } from "./option";
import { CameraComponent } from "./lifefeed";
import { Bottom } from "./subbottom";
import { Easynavigator } from "./Navtab";
import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { useExamLifecycle } from "../customHookes/useExamLifeCycle";
import { ExamContext } from "../pages/examPage";
import { useNavigate } from "react-router-dom";
import { submitExamAnswers } from "../api/examSubmit";
import { HARD_KILL_CAMERA } from "../constant";
export const Main = ({
  regNo,
  userClass,
  Exam,
  Subject,
  time,
  state
}) => {
  //const answer =answers.find((it) => it.questionId === question.id)?.answerChoosen ?? null;
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(state==="minutes"?(time || 0) * 60:time);
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
    currentExam,
    socket,
    setSocket,
    subject,
    className
  } = useContext(ExamContext);

  // ----------------------------------------------
  // Timer calculation
  // ----------------------------------------------
  const { hr, min, sec } = useMemo(() => {
    const hr = Math.floor(timeLeft / 3600);
    const min = Math.floor((timeLeft % 3600) / 60);
    const sec = timeLeft % 60;
    return { hr, min, sec };
  }, [timeLeft]);

  // ----------------------------------------------
  // Track the latest answers using a ref
  // ----------------------------------------------
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers; // always up-to-date
  }, [answers]);

  // ----------------------------------------------
  // Current question index & answer
  // ----------------------------------------------
  const number = examQuestions.findIndex((q) => q.id === question.id);
  const answer = useMemo(() => {
    return answersRef.current.find(it => it.questionId === question.id)?.answerText ?? null;
  }, [question.id]);

  // ----------------------------------------------
  // CAMERA CLEANUP & SUBMISSION
  // ----------------------------------------------
  const submitLock = useRef(false);
  const handleSubmitRef = useRef();

  const handleSubmit = async (reason = "Submitted") => {
    if (submitLock.current) return;
    submitLock.current = true;

    try {
      console.log("Submitting because:", reason);
      setIsSubmitted(true);

      // Use answersRef.current to get latest answers
      await submitExamAnswers(regNo, currentExam, answersRef.current);

      let ackReceived = false;

      // Notify server and leave
      socket.emit(
        "student-leave",
        { studentId: regNo, examId: currentExam,timeLeft: timeLeft },
        (ack) => {
          console.log("LEAVE ACK:", ack);
          ackReceived = true;
          try {
            socket.close();
            setSocket(null);
            HARD_KILL_CAMERA();
          } catch { }

          setTimeout(() => navigate("/"), 120);
        }
      );

      // Fallback if server doesn't ack within 600ms
      setTimeout(() => {
        if (!ackReceived) {
          console.warn("No ack, fallback disconnect");
          try { socket.close(); } catch { }
          setTimeout(() => navigate("/", { replace: true }), 150);
        }
      }, 600);

    } catch (err) {
      submitLock.current = false;
      console.error(err);
      alert(err.message || "Error submitting exam");
      setIsPaused(true);
    }
  };

  // assign handleSubmit to ref
  handleSubmitRef.current = handleSubmit;

  // ----------------------------------------------
  // Call your hook
  // ----------------------------------------------
  useExamLifecycle({
    isPaused,
    isSubmitted,
    timeLeft,
    setTimeLeft,
    handleSubmitRef, // pass ref
    socket,
    regNo,
    currentExam,
    subject,
    className,
    answersRef,       // pass ref instead of raw answers
  });

  //----------------------------------------------
  // FINAL SUBMIT HANDLER
  //----------------------------------------------
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
              border: "0.5px solid rgb(37, 155, 194)",
              borderRadius: "8px",
            }}
          >
            <div className="container-fluid">
              <div className="row">
                <div
                  className="col-md-8"
                  style={{
                    height: "80vh",
                    borderRight: "1px solid rgb(37, 155, 194)",
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
                    save={(option) => answerQuestion(option)}
                    answer={answersRef.current.find(it => it.questionId === question.id)?.answerText ?? null}
                  />
                  <Easynavigator
                    num={number}
                    show={tabledisplay}
                    answered={answersRef.current}
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
                    {!isSubmitted && <CameraComponent />}
                  </div>

                  {/* Spacer pushes the button down */}
                  <div className="flex-grow-1"></div>

                  {/* Submit Button */}
                  <button
                    className="btn btn-success mb-4"
                    style={{
                      backgroundColor: "rgb(37, 155, 194)",
                      borderColor: "rgb(37, 155, 194)",
                      fontWeight: "bold",
                      color: "white",
                      width: "150px",
                      borderRadius: "8px",
                    }}
                    onClick={() => handleSubmitRef.current?.()}
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
