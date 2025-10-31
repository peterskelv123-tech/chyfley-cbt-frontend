import axios from "axios";
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": process.env.REACT_APP_API_CONTENT_TYPE,
    Accept: process.env.REACT_APP_API_ACCEPT,
  },
});
export const fetchExamQuestions = async (examId) => {
  if (!examId) throw new Error("No examId provided");

  try {
    const response = await api.get(`/questions/exam-taker`, {
      params: { examId }, // pass examId as query
    });
    console.log("📥 Server Response:", response.data);
    // Always return an array (avoid undefined for React Query)
    return response.data?.data ?? [];
  } catch (e) {
    console.error("❌ Error fetching exam questions:", e);
    throw e;
  }
}
export const fetchExamDetails = async (page) => {
  try {
    const response = await api.get("/exams", {
      params: { page }
    })
    console.log("📥 Server Response:", response.data);
    // Always return an array (avoid undefined for React Query)
    return response.data?.data ?? [];
  } catch (e) {
    console.error("❌ Error fetching exam questions:", e);
    throw e;
  }
}

