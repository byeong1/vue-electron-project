import axios from "axios";

interface QuizRequest {
    stage: string;
    grade: string;
}

interface QuizResponse {
    quiz: string;
    hint: string;
    answer: string;
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const generateQuiz = async (request: QuizRequest): Promise<QuizResponse> => {
    try {
        const prompt = `
            ${request.stage} ${request.grade}학년 수준에 맞는 수학 문제를 생성해주세요.
            문제, 힌트, 정답을 JSON 형식으로 반환해주세요.
            문제는 실생활과 연관된 예시를 들어 설명해주세요.
            힌트는 문제를 푸는 방법을 단계별로 설명해주세요.
            정답은 숫자와 단위를 포함하여 정확하게 작성해주세요.
        `;

        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful math teacher creating educational quizzes.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            },
            {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("퀴즈 생성 중 오류 발생:", error);
        throw new Error("퀴즈를 생성하는 중 오류가 발생했습니다.");
    }
};
