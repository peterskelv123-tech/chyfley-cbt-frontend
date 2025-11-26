import axios from "axios";
import { fieldsWithFindAll } from "../constant";
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": process.env.REACT_APP_API_CONTENT_TYPE,
    Accept: process.env.REACT_APP_API_ACCEPT,
  },
});
export const fetchExamQuestions = async (examId, studentId) => {
  if (!examId) throw new Error("No examId provided");
  console.log("get exam questions for:", studentId);
  try {
    const questionsRes = await api.get(`/questions/exam-taker`, { params: { examId, studentId } });
    const questions = questionsRes.data?.data ?? [];
    return questions;
  } catch (e) {
    console.error("❌ Error fetching exam questions:", e);
    return []; // return empty array safely
  }
};

export const fetchUserProgress = async (examId, studentId) => {
  try {
    const response = api.get("/redis/student-progress", { params: { examId, studentId } })
    return (await response).data.data || { answers: [], currentIndex: 0, questionMeta: [], totalQuestionsAnswered: 0 }
  } catch (error) {
    console.error("❌ Error fetching exam questions:", error);
    throw error;
  }
}
export const fetchAllData = async (field) => {
  try {
    if (typeof field !== "string") {
      throw new Error("Field must be a string");
    }

    const key = field.toLowerCase();

    if (!fieldsWithFindAll.includes(key)) {
      throw new Error(`Invalid field. Allowed: ${fieldsWithFindAll.join(", ")}`);
    }

    const response = await api.get(key);
    return response.data?.data ?? [];
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    throw error; // Let UI layer decide how to notify user
  }
};
export const fetchAttendance = async (socket) => {
  if (!socket) throw new Error("Socket not initialized");

  return new Promise((resolve) => {
    socket.emit('admin-join', null, (snapshot) => resolve(snapshot));
  });
};

export const fetchExamDetails = async (page) => {
  console.log("Fetching exam details for page:", page);
  try {
    const response = await api.get("/exams", {
      params: { page }
    })
    console.log("📥 Server Response:", response.data.data);
    // Always return an array (avoid undefined for React Query)
    return response.data?.data ?? [];
  } catch (e) {
    console.error("❌ Error fetching exam questions:", e);
    throw e;
  }
}
export const fetchResults = async (className, subject, examType) => {
  try {
    const response = await api.get("/results", {
      params: { className, subject, examType }
    })
    return response.data?.data ?? [];
  } catch (error) {
    console.error("❌ Error fetching exam questions:", error);
    throw error;
  }
}
