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

5. 문제의 주제:
   - 문제의 주제를 제시
   - 문제가 수학적으로 어떤 개념이 필요한지에 대한 내용
6. 문제의 난이도:
   - 문제의 난이도를 제시
   - 초급, 중급, 고급으로 분류

반드시 다음 JSON 형식으로 응답해줘:
{
    "quiz": "생성된 문제 내용",
    "hint": "생성된 힌트 내용",
    "answer": "생성된 문제의 정답",
    "topic": "생성된 문제의 주제",
    "difficulty": "생성된 문제의 난이도",
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

export const generateFortune = async (
    birthDate: string,
    birthTime: string,
    fortuneType: string = "daily",
): Promise<IOllamaResponse> => {
    const getFortuneTypeText = (type: string): string => {
        if (type === "daily") {
            return "오늘의";
        } else if (type === "weekly") {
            return "이번 주의";
        } else if (type === "monthly") {
            return "이번 달의";
        } else {
            return "오늘의";
        }
    };

    const fortuneTypeText = getFortuneTypeText(fortuneType);

    const prompt: string = `<start_of_turn>system
너는 이제부터 한국 최고의 사주팔자 전문가야. 사용자의 생년월일과 시간을 기반으로 ${fortuneTypeText} 운세를 정확하게 봐줘.
<end_of_turn>

<start_of_turn>user
다음 정보를 바탕으로 ${fortuneTypeText} 운세를 봐줘:

생년월일: ${birthDate}
출생시간: ${birthTime}
기간: ${fortuneTypeText} 운세

다음 내용을 포함해서 운세를 봐줘:
1. ${fortuneTypeText} 전체 운세
2. ${fortuneTypeText} 금전운
3. ${fortuneTypeText} 건강운
4. ${fortuneTypeText} 인간관계운
5. ${fortuneTypeText} 조언

반드시 다음 JSON 형식으로 응답해줘:
{
    "overall": "${fortuneTypeText} 전체 운세 내용",
    "money": "${fortuneTypeText} 금전운 내용",
    "health": "${fortuneTypeText} 건강운 내용",
    "relationship": "${fortuneTypeText} 인간관계운 내용",
    "advice": "${fortuneTypeText} 조언 내용"
}
<end_of_turn>

<start_of_turn>model
운세를 보기 전에 다음을 확인해줘:
1. 사주팔자의 정확성
2. 각 운세의 구체성
3. 조언의 실용성
4. ${fortuneTypeText} 운세에 맞는 적절한 내용인지 확인
<end_of_turn>`;

    const response = await axiosInstance.post<IOllamaResponse>("/generate", {
        model: "gemma3:12b",
        prompt: prompt,
        stream: true,
        format: "json",
    });

    let fullResponse = "";
    const lines = response.data.split("\n");

    for (const line of lines) {
        if (!line.trim()) continue;

        try {
            const jsonData = JSON.parse(line);
            if (jsonData.response) {
                fullResponse += jsonData.response;
            }

            if (jsonData.done) {
                break;
            }
        } catch (error) {
            console.error("JSON 파싱 오류:", error);
        }
    }

    try {
        return JSON.parse(fullResponse);
    } catch (error) {
        console.error("최종 응답 파싱 오류:", error);
        throw new Error("운세 생성에 실패했습니다.");
    }
};
