import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useQuery } from "@tanstack/react-query";
import { reviewQuestion } from "../api/baseAxious";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { handlePostForm } from "../api/formPost";
import toast from "react-hot-toast";
export default function QuizEditor() {
  const { examId, class_name, subject } = useParams();
  const [modalState, setModalState] = useState({
    visibility: false,
    topic: "",
  });
  const openModal = (topic) => {
    setModalState({
      visibility: true,
      topic,
    });
  };
  const closeModal = () => {
    setModalState({
      visibility: false,
      topic: "",
    });
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { data: question_review, isLoading, error } = useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: () => reviewQuestion(examId),
  });
  useEffect(() => {
    if (!error && !isLoading) {
      console.log(question_review)
    }
  }
    , [isLoading, question_review, error])
  // 🔥 Use API data directly
  const quizzes = question_review?.questions || [];
  const exam = question_review?.exam;

  const [index, setIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const current = quizzes?.[index];

  // 🛠 local updates (non-persistent for now)
  const updateField = (field, value) => {
    quizzes[index][field] = value;
  };
  const handleImport = async (data) => {
    const payload = {
      fromExamId: Number(examId),
      examData: {
        examType: data.examType,
        session: data.session,
        term: data.term,
        subject: data.subject,
        className: data.className,
        totalQuestions: Number(data.totalQuestions),
      }
    };
    //console.log(payload)
    const promise = handlePostForm(payload, "/exams/import-questions", "application/json");

    toast.promise(promise, {
      loading: "Importing exam...",
      success: "Exam imported successfully!",
      error: (err) =>
        err?.response?.data?.message || "Failed to import exam.",
    });

    try {
      const response = await promise;
      console.log("Import response:", response);
      //reset();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };
  const updateOption = (i, value) => {
    quizzes[index].options[i] = value;
  };

  const deleteQuestion = () => {
    quizzes.splice(index, 1);
    setIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const next = () => setIndex((i) => Math.min(i + 1, quizzes.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // ❌ ERROR UI
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card p-4 shadow-sm text-center">
          <h4 className="text-danger mb-3">⚠️ Something went wrong</h4>
          <p>{error?.message || "Failed to load exam questions"}</p>

          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🔄 LOADING OVERLAY */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "4rem", height: "4rem" }}
          />
          <p className="mt-3 fw-semibold">Loading exam questions...</p>
        </div>
      )}

      <div className="container-fluid min-vh-100 bg-light">
        <div className="row min-vh-100">

          {/* Sidebar */}
          <div className="col-3 bg-white border-end p-3 d-flex flex-column">
            <h4 className="mb-3">Exam Details</h4>

            {exam && (
              <>
                <p><strong>Type:</strong> {exam.examType}</p>
                <p><strong>Session:</strong> {exam.session}</p>
                <p><strong>Term:</strong> {exam.term}</p>
                <p><strong>Class:</strong> {class_name}</p>
                <p><strong>Subject:</strong> {subject}</p>
              </>
            )}

            <p>Total Questions: {quizzes.length}</p>
            <p>Current Index: {index + 1}</p>

            <button className="btn btn-success w-100 mt-3">
              Add Question
            </button>

            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => openModal("Import Exam")}
            >
              Import Exam
            </button>
          </div>

          {/* Main */}
          <div className="col-9 p-4 d-flex flex-column">

            {!isLoading && quizzes.length === 0 && (
              <div className="text-center mt-5">
                <h5>No questions found for this exam</h5>
              </div>
            )}

            {current && (
              <div className="card p-4 shadow-sm flex-grow-1">

                {/* Question */}
                {editMode ? (
                  <textarea
                    className="form-control mb-3"
                    rows={5}
                    style={{ resize: "vertical", maxHeight: "200px", overflowY: "auto" }}
                    value={current.question}
                    onChange={(e) => updateField("question", e.target.value)}
                  />
                ) : (
                  <div
                    className="mb-3 p-2 border rounded"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <h5 className="mb-0">{current.question}</h5>
                  </div>
                )}
                {modalState.visibility && modalState.topic === "Import Exam" && (
                  <div
                    className="modal d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content p-3">

                        <div className="modal-header">
                          <h5 className="modal-title">Import Exam Setup</h5>
                          <button
                            className="btn-close"
                            onClick={() => {
                              closeModal();
                              reset();
                            }}
                          />
                        </div>

                        <form onSubmit={handleSubmit(handleImport)}>

                          <div className="modal-body">

                            {/* SOURCE */}
                            <div className="alert alert-info">
                              <strong>Source Exam ID:</strong> {examId}
                            </div>

                            {/* EXAM TYPE */}
                            <div className="mb-3">
                              <label>Exam Type</label>
                              <input
                                className="form-control"
                                {...register("examType", {
                                  required: "Exam type is required",
                                })}
                              />
                            </div>

                            {/* SESSION */}
                            <div className="mb-3">
                              <label>Session</label>
                              <input
                                className="form-control"
                                {...register("session", {
                                  required: "Session is required",
                                })}
                              />
                            </div>

                            {/* TERM */}
                            <div className="mb-3">
                              <label>Term</label>
                              <input
                                className="form-control"
                                {...register("term", {
                                  required: "Term is required",
                                })}
                              />
                            </div>

                            {/* TOTAL QUESTIONS */}
                            <div className="mb-3">
                              <label>Total Questions</label>
                              <input
                                type="number"
                                className="form-control"
                                {...register("totalQuestions", {
                                  required: "Total questions is required",
                                })}
                              />
                            </div>

                            {/* TIME ALLOCATED (🔥 FIXED MISSING FIELD) */}
                            <div className="mb-3">
                              <label>Time Allocated (minutes)</label>
                              <input
                                type="number"
                                className="form-control"
                                {...register("timeAllocated", {
                                  required: "Time allocated is required",
                                })}
                              />
                            </div>

                            {/* SUBJECT */}
                            <div className="mb-3">
                              <label>Subject</label>
                              <input
                                className="form-control"
                                {...register("subject", {
                                  required: "Subject is required",
                                })}
                              />
                            </div>

                            {/* CLASS */}
                            <div className="mb-3">
                              <label>Class</label>
                              <input
                                className="form-control"
                                {...register("className", {
                                  required: "Class is required",
                                })}
                              />
                            </div>

                            {/* SUBMIT */}
                            <button className="btn btn-success w-100">
                              Import Exam
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                {/* Options */}
                <div className="row">
                  {current.options.map((opt, i) => (
                    <div className="col-6 mb-2" key={i}>
                      {editMode ? (
                        <input
                          className="form-control"
                          value={opt}
                          onChange={(e) =>
                            updateOption(i, e.target.value)
                          }
                        />
                      ) : (
                        <div className="border p-2 bg-light rounded">
                          {opt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Answer */}
                {editMode ? (
                  <input
                    className="form-control mt-3"
                    value={current.correctAnswer}
                    onChange={(e) =>
                      updateField("correctAnswer", e.target.value)
                    }
                  />
                ) : (
                  <div className="alert alert-info mt-3">
                    Correct Answer: {current.correctAnswer}
                  </div>
                )}

                {/* Controls */}
                <div className="d-flex gap-2 mt-auto pt-3">
                  <button onClick={prev} className="btn btn-secondary">
                    Prev
                  </button>

                  <button onClick={next} className="btn btn-secondary">
                    Next
                  </button>

                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="btn btn-warning"
                  >
                    {editMode ? "Lock" : "Edit"}
                  </button>
                  <button
                    onClick={deleteQuestion}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}