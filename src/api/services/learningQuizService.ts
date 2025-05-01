import axiosInstance from "@api/config";

export const saveLearningQuiz = async (token: string, payload: { quiz: string }) => {
    const response = await axiosInstance.post("/api/learning-quiz", payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
