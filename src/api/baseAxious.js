import axios from "axios";
import { fieldsWithFindAll, ALL_EXAM_FILTERS } from "../constant";
import toast from "react-hot-toast";
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": process.env.REACT_APP_API_CONTENT_TYPE,
    Accept: process.env.REACT_APP_API_ACCEPT,
  },
});
export const backend_mapping_of_filter = {
  [ALL_EXAM_FILTERS[0]]: "examType",
  [ALL_EXAM_FILTERS[1]]: "term",
  [ALL_EXAM_FILTERS[2]]: "session"
};
export const fetchExamDetailFilters = async (filterKey) => {
  if (!filterKey) throw new Error("No filter key provided");
  if (!ALL_EXAM_FILTERS.includes(filterKey)) throw new Error(`Invalid filter key. Allowed: ${ALL_EXAM_FILTERS.join(", ")}`);
  try {
    const response = await api.get(`/exams/${filterKey}`);
    return response.data?.data ?? [];
  } catch (error) {
    console.error("❌ Error fetching exam detail filters:", error);
    throw error;
  }
}
export const reviewQuestion = async (examId) => {
  //console.log("fetching questions for:", examId)
  try {
    const response = await api.get(`/questions/question-review`, { params: { examId } });
    //console.log("Received question review data:", response.data);
    return response.data ?? [];
  }
  catch (e) {
    console.error("❌ Error reviewing questions:", e);
    throw e;
  }
}
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
    console.log("Fetched user progress:", await response);
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

export const fetchExamDetails = async (page, searchKey = "", ...filters) => {
  console.log("Fetching exam details for page:", page, "searchKey:", searchKey, "filters:", filters);
  try {
    const response = await api.get("/exams", {
      params: {
        page, searchKey, ...filters.reduce((acc, filter, index) => {
          acc[backend_mapping_of_filter[ALL_EXAM_FILTERS[index]]] = filter;
          return acc;
        }, {})
      }
    })
    console.log("📥 Server Response:", response.data.data);
    // Always return an array (avoid undefined for React Query)
    return response.data?.data ?? [];
  } catch (e) {
    console.error("❌ Error fetching exam questions:", e);
    throw e;
  }
}
export const downloadResult = async (
  className,
  subject,
  examType,
  session,
  term
) => {
  try {
    const response = await api.get("/results/download", {
      params: {
        className,
        subject,
        examType,
        session,
        term,
      },
      responseType: "blob", // 🔥 critical
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${className}_${subject}_${examType}_${session}_${term}_results.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download result error:", error);

    // 🔔 Friendly error message
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to download result. Please try again.";

    toast.error(message);
  }
};
export const fetchResults = async (className, subject, examType, session, term) => {
  try {
    console.log("fetching result with the following details", [className, subject, examType, session, term])
    const response = await api.get("/results", {
      params: { className, subject, examType, session, term }
    })
    return response.data?.data ?? [];
  } catch (error) {
    console.error("❌ Error fetching exam questions:", error);
    throw error;
  }
}
