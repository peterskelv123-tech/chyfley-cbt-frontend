import { api } from "./baseAxious"
export const handlePostForm = async (data) => {
    try {
        // Create a FormData instance
        const formData = new FormData();
        for (const key of Object.keys(data)) {
            switch (key) {
                case "questionFile":
                    // Handled separately below
                    formData.append("questionFile", data.questionFile[0]);
                    break;
                case "questionToAnswer":
                    formData.append("totalQuestions", data[key]);
                    break;
                default:
                    formData.append(key, data[key]);
            }
        }
        console.log("Form Data Submitted:", Object.fromEntries(formData.entries()));
        // ✅ Send request using axios
        const response = await api.post("/exams", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // crucial for file uploads
            },
        });

        // ✅ Handle response
        if (response.status === 201) {
            alert("Exam created successfully!");
        } else {
            alert("Unexpected response: " + response.status);
        }

        // ✅ Reset form & close modal
    } catch (error) {
        throw error;
    }
}