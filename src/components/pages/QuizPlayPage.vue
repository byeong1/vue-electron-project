<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";

import { generateQuiz } from "@api/services/ollamaService";

import { EDUCATION_STAGE, GRADE, QUIZ_BUTTON } from "@constants";

import type { IQuizData, IButtonOption } from "@types";

/* 상수 정의 */
const QUIZ_BUTTONS: IButtonOption[] = [
    {
        label: QUIZ_BUTTON.HINT,
        value: QUIZ_BUTTON.HINT,
        color: "white",
    },
    {
        label: QUIZ_BUTTON.ANSWER,
        value: QUIZ_BUTTON.ANSWER,
        color: "white",
    },
    {
        label: "다음 문제",
        value: "NEXT",
        color: "white",
    },
];

/* 임시 상수 정의 (주석 처리)
const DUMMY_QUIZ = {
    quiz: "사과가 4개 있었는데, 2개를 먹었어요. 남은 사과는 몇 개인가요?",
    hint: "처음에 가진 사과의 수와 먹은 사과의 수를 이용해 남은 수를 빼기로 계산해보세요.",
    answer: "2개",
};
*/

/* 훅 및 상태 정의 */
const router = useRouter();
const route = useRoute();

const selectedButton = ref<number | null>(null);
const selectedButtonValue = ref<string | null>(null);
const isLoading = ref<boolean>(false);

const stage = ref<string | null>((route.query.stage as string) || null);
const grade = ref<string | null>((route.query.grade as string) || null);

const currentQuiz = ref<IQuizData | null>(null);

/* 메서드 */
const handleButtonClick = (index: number, label: string, value: string): void => {
    if (value === QUIZ_BUTTON.BACK) {
        router.push("/");
        return;
    } else if (value === "NEXT") {
        generateNextQuiz();
        return;
    } else if (selectedButton.value === index) {
        selectedButton.value = null;
        selectedButtonValue.value = null;
    } else {
        selectedButton.value = index;
        selectedButtonValue.value = value;
    }
};

const generateNextQuiz = async (): Promise<void> => {
    isLoading.value = true;
    try {
        const nestQuizData: IQuizData = await generateQuiz(
            stage.value,
            grade.value,
            currentQuiz.value?.quiz,
        );

        console.log("nestQuizData :", nestQuizData);

        sessionStorage.setItem("currentQuiz", JSON.stringify(nestQuizData));

        // 상태 초기화
        selectedButton.value = null;
        selectedButtonValue.value = null;
        currentQuiz.value = nestQuizData;

        // 같은 경로로 이동
        router.push({
            path: "/quiz/play",
            query: {
                stage: stage.value,
                grade: grade.value,
            },
        });
    } catch (error) {
        console.error("퀴즈 생성 중 오류 발생:", error);

        alert("다음 문제를 생성하는데 실패했습니다.");
    } finally {
        isLoading.value = false;
    }
};

const validateStageAndGrade = (): boolean => {
    const isValidStage = stage.value ? Object.values(EDUCATION_STAGE).includes(stage.value) : false;
    const isValidGrade = grade.value ? Object.values(GRADE).includes(grade.value) : false;

    return isValidStage && isValidGrade;
};

const loadQuizFromSession = (): void => {
    const quizData: string | null = sessionStorage.getItem("currentQuiz");
    if (quizData) {
        try {
            currentQuiz.value = JSON.parse(quizData) as IQuizData;
        } catch (error) {
            console.error("퀴즈 데이터 파싱 실패:", error);

            alert("퀴즈 데이터를 불러오는데 실패했습니다.");

            router.push("/");
        }
    } else {
        alert("퀴즈 데이터가 없습니다.");

        router.push("/");
    }
};

/* 라이프사이클 훅 */
onMounted(() => {
    if (!validateStageAndGrade()) {
        alert("잘못된 요청입니다.");

        router.push("/");

        return;
    }

    loadQuizFromSession();
});
</script>

<template>
    <div class="container">
        <SingleBox v-if="currentQuiz && !isLoading" class="quiz-box">
            <div class="quiz-text">
                {{ currentQuiz.quiz }}
            </div>
        </SingleBox>

        <div v-else class="loading">
            {{ isLoading ? "문제 생성 중..." : "문제를 불러오는 중..." }}
        </div>

        <div v-if="currentQuiz && !isLoading" class="quiz-button">
            <MultiButton
                :buttons="QUIZ_BUTTONS"
                @button-click="handleButtonClick"
                :selected-button="selectedButton"
            />
        </div>

        <SingleBox v-if="selectedButtonValue && currentQuiz && !isLoading" class="answer-box">
            <div class="answer-text">
                {{
                    selectedButtonValue === QUIZ_BUTTON.HINT ? currentQuiz.hint : currentQuiz.answer
                }}
            </div>
        </SingleBox>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.quiz-box {
    width: 100%;
    max-width: 500px;
    height: auto;
    margin-top: 20px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
}

.quiz-text {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    padding: 20px;
    line-height: 1.5;
    color: #333;
    word-break: keep-all;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 20px;
    color: #666;
}

.quiz-button {
    margin: 30px auto;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.answer-box {
    margin-top: 20px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    position: relative;
}

.answer-box::before {
    content: "";
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: black;
    width: 100%;
}

.answer-text {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 18px;
    padding: 20px;
    line-height: 1.5;
    color: #495057;
    word-break: keep-all;
    white-space: pre-line;
}

@media (max-width: 768px) {
    SingleBox {
        width: 100%;
        max-width: 100%;
        height: auto;
    }
}
</style>
