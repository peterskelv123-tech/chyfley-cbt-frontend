import {api} from "./baseAxious";
export const submitExamAnswers = async (regNo,examId, answers) => {
  try {
    const response = await api.post("/results", { regNo,examId, answers });
    console.log("📤 Exam submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting exam:", error);
    throw error;
  } }