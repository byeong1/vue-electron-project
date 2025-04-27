import type { IQuizData } from "@/types";
import axiosInstance from "@api/config";

import type { IOllamaResponse } from "@types";

let conversationContext: number[] | undefined = undefined;

export const generateQuiz = async (
    selectedStage: string,
    selectedGrade: string,
    beforeQuiz: string = "",
): Promise<IOllamaResponse> => {
    const prompt: string = `<start_of_turn>system
너는 이제부터 한국 최고의 ${selectedStage} ${selectedGrade}학년 수학 문제 생성 AI야.
<end_of_turn>

<start_of_turn>user
다음 조건에 맞는 수학 문제를 생성해줘:

// 0. 기존 생성된 문제 : ${beforeQuiz}

1. 문제 난이도: ${selectedStage} ${selectedGrade}학년 수준에 맞게 설정
2. 문제 내용:
   - 문제는 랜덤으로 생성
   - 필요한 정보는 모두 포함
   - 문제를 풀기위해 빠진 정보가 없는지 검토
   - 기존에 생성했던 문제랑 중복되지 않은 문제인지 검토
3. 힌트:
   - 문제를 푸는 방법을 단계별로 설명
   - 수학적 개념을 쉽게 설명
4. 정답:
   - 정확한 숫자와 단위를 포함
   - 정확한 정답만 제시
   - 제시한 정답이 생성된 문제의 정답이 맞는지 검토

반드시 다음 JSON 형식으로 응답해줘:
{
    "quiz": "생성된 문제 내용",
    "hint": "생성된 힌트 내용",
    "answer": "생성된 문제의 정답",
}
<end_of_turn>

<start_of_turn>model
문제를 생성하기 전에 다음을 확인해줘:
1. 문제의 정확성
2. 난이도의 적절성
3. 정답의 정확성
4. 힌트의 유용성
<end_of_turn>`;

    const response = await axiosInstance.post<IOllamaResponse>("/generate", {
        model: "gemma3:12b",
        prompt: prompt,
        stream: true,
        format: "json",
        context: conversationContext,
    });

    let fullResponse = "";
    const lines = response.data.split("\n");
    let lastContext: number[] | undefined = undefined;

    for (const line of lines) {
        if (!line.trim()) continue;

        try {
            const jsonData = JSON.parse(line);
            if (jsonData.response) {
                fullResponse += jsonData.response;
            }

            if (jsonData.context) {
                lastContext = jsonData.context;
            }

            if (jsonData.done) {
                conversationContext = lastContext;
                break;
            }
        } catch (error) {
            console.error("JSON 파싱 오류:", error);
        }
    }

    try {
        return JSON.parse(fullResponse) as IQuizData;
    } catch (error) {
        console.error("최종 응답 파싱 오류:", error);
        throw new Error("퀴즈 생성에 실패했습니다.");
    }
};
