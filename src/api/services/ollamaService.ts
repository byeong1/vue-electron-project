import axiosInstance from "@api/config";

import type { IOllamaResponse, IQuizData } from "@types";

/* 운세 생성 */
export const generateFortune = async (
    birthDate: string,
    birthTime: string,
    fortuneType: string = "daily",
): Promise<IOllamaResponse> => {
    // 한국 시간 기준 오늘 날짜 구하기
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const year = kstNow.getUTCFullYear();
    const month = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
    const day = String(kstNow.getUTCDate()).padStart(2, "0");
    const today = `${year}년 ${month}월 ${day}일 `;

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
너는 이제부터 한국 최고의 사주팔자 전문가야. ${today}사용자의 생년월일과 시간을 기반으로 ${fortuneTypeText} 운세를 정확하게 봐줘.
<end_of_turn>

<start_of_turn>user
다음 정보를 바탕으로 ${fortuneTypeText} 운세를 봐줘:

생년월일: ${birthDate}
출생시간: ${birthTime}
기간: ${fortuneTypeText} 운세

다음 내용을 포함해서 운세를 봐줘:
1. ${fortuneTypeText} 전체 운세
2. ${fortuneTypeText} 연애운
2. ${fortuneTypeText} 금전운
3. ${fortuneTypeText} 건강운
4. ${fortuneTypeText} 인간관계운
5. ${fortuneTypeText} 조언

반드시 다음 JSON 형식으로 응답해줘:
{
    "overall": "${fortuneTypeText} 전체 운세 내용",
    "love": "${fortuneTypeText} 연애운 내용",
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

    try {
        const response = await axiosInstance.post<IOllamaResponse>("/api/llm/fortune", {
            prompt,
        });

        return response.data;
    } catch (error) {
        console.error("운세 생성 요청 실패:", error);
        throw new Error("운세 생성에 실패했습니다.");
    }
};

const makeQuizPrompt = (stage: string, grade: string): string => {
    return `<start_of_turn>system
너는 이제부터 한국 최고의 ${stage} ${grade}학년 수학 문제 생성 AI야.
<end_of_turn>

<start_of_turn>user
다음 조건에 맞는 수학 문제를 생성해줘:

1. 문제 난이도: ${stage} ${grade}학년 수준에 맞게 설정
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
   - 반올림 금지

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
};

/* 로그인 사용자용 */
export const generateQuizWithAuth = async (
    stage: string,
    grade: string,
    token: string,
): Promise<IQuizData> => {
    const prompt = makeQuizPrompt(stage, grade);
    try {
        const response = await axiosInstance.post<IQuizData>(
            "/api/llm/quiz",
            { prompt },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data;
    } catch (error) {
        console.error("퀴즈 생성 요청 실패:", error);
        throw new Error("퀴즈 생성에 실패했습니다.");
    }
};

/* 비로그인 사용자용 */
export const generateQuizWithoutAuth = async (stage: string, grade: string): Promise<IQuizData> => {
    const prompt = makeQuizPrompt(stage, grade);
    try {
        const response = await axiosInstance.post<IQuizData>("/api/llm/quiz/guest", { prompt });
        return response.data;
    } catch (error) {
        console.error("퀴즈 생성 요청 실패:", error);
        throw new Error("퀴즈 생성에 실패했습니다.");
    }
};
