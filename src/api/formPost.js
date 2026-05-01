import { api } from "./baseAxious"
export const handlePostForm = async (data, endpoint, contentType) => {
    try {
        // Create a FormData instance
        const formData = new FormData();
        for (const key of Object.keys(data)) {
            switch (key) {
                case "questionFile":
                    formData.append("questionFile", data.questionFile[0]);
                    break;

                case "questionToAnswer":
                    formData.append("totalQuestions", data[key]);
                    break;

                default:
                    const value = data[key];

                    if (typeof value === "object" && value !== null) {
                        formData.append(key, JSON.stringify(value)); // ✅ FIX
                    } else {
                        formData.append(key, value);
                    }
            }
        }
        console.log("Form Data Submitted:", Object.fromEntries(formData.entries()));
        // ✅ Send request using axios
        const response = await api.post(endpoint, formData, {
            headers: {
                "Content-Type": contentType || "multipart/form-data", // crucial for file uploads
            },
        });
        return response
        // ✅ Handle response
        // if (response.status === 201) {
        //     //alert("Exam created successfully!");
        // } else {
        //     alert("Unexpected response: " + response.status);
        // }

        // ✅ Reset form & close modal
    } catch (error) {
        throw error;
    }
}