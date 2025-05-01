<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";

import { generateQuizWithAuth, generateQuizWithoutAuth } from "@api/services/ollamaService";
import { saveLearningQuiz } from "@api/services/learningQuizService";

import { EDUCATION_STAGE, GRADE } from "@constants";

import type { IQuizData, IButtonOption } from "@types";

/* 상수 정의 */
const QUIZ_BUTTON = {
    HINT: "힌트 보기",
    ANSWER: "정답 보기",
    NEXT: "다음 문제",
    LEARN: "문제 학습",
};

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
        label: QUIZ_BUTTON.NEXT,
        value: QUIZ_BUTTON.NEXT,
        color: "white",
    },
    {
        label: QUIZ_BUTTON.LEARN,
        value: QUIZ_BUTTON.LEARN,
        color: "white",
        disabledLabel: "학습 완료",
    },
];

/* 훅 및 상태 정의 */
const router = useRouter();
const route = useRoute();

const selectedButton = ref<number | null>(null);
const selectedButtonValue = ref<string | null>(null);

const isLoading = ref<boolean>(false);

const isLearnCompleted = ref<boolean>(false);

const stage = ref<string | null>((route.query.stage as string) || null);
const grade = ref<string | null>((route.query.grade as string) || null);

const currentQuiz = ref<IQuizData | null>(null);

/* 계산된 속성 */
const isLoggedIn = computed<boolean>(() => {
    return !!localStorage.getItem("access_token");
});

/* 메서드 */
const handleButtonClick = async (index: number, label: string, value: string): Promise<void> => {
    if (value === QUIZ_BUTTON.NEXT) {
        generateNextQuiz();
        return;
    } else if (value === QUIZ_BUTTON.LEARN) {
        if (isLearnCompleted.value) return;
        await handleLearnClick();
        return;
    } else if (selectedButton.value === index) {
        selectedButton.value = null;
        selectedButtonValue.value = null;
    } else {
        selectedButton.value = index;
        selectedButtonValue.value = value;
    }
};

/* 문제 학습 버튼 */
const handleLearnClick = async (): Promise<void> => {
    if (!currentQuiz.value || isLearnCompleted.value) return;

    try {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        await saveLearningQuiz(token, { quiz: currentQuiz.value.quiz });

        isLearnCompleted.value = true;

        alert("문제가 학습 목록에 추가되었습니다.");
    } catch (error) {
        console.error("문제 학습 저장 실패:", error);
        alert("문제 학습 저장에 실패했습니다.");
    }
};

/* 다음 문제 생성 버튼 */
const generateNextQuiz = async (): Promise<void> => {
    isLoading.value = true;
    try {
        let nestQuizData: IQuizData;
        const token = localStorage.getItem("access_token");
        if (token) {
            nestQuizData = await generateQuizWithAuth(stage.value, grade.value, token);
        } else {
            nestQuizData = await generateQuizWithoutAuth(stage.value, grade.value);
        }

        sessionStorage.setItem("currentQuiz", JSON.stringify(nestQuizData));

        /* 상태 초기화 */
        selectedButton.value = null;
        selectedButtonValue.value = null;

        isLearnCompleted.value = false;

        currentQuiz.value = nestQuizData;
    } catch (error) {
        console.error("퀴즈 생성 중 오류 발생:", error);

        alert("다음 문제를 생성하는데 실패했습니다.");
    } finally {
        isLoading.value = false;
    }
};

/* 유효한 학습 단계와 학년 검증 */
const validateStageAndGrade = (): boolean => {
    const isValidStage = stage.value ? Object.values(EDUCATION_STAGE).includes(stage.value) : false;
    const isValidGrade = grade.value ? Object.values(GRADE).includes(grade.value) : false;

    return isValidStage && isValidGrade;
};

/* 세션에서 퀴즈 데이터 로드 */
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
    <div class="quiz-play-page">
        <SingleBox v-if="currentQuiz && !isLoading" variant="outlined" class="quiz-box">
            <div class="quiz-header">
                <div class="quiz-info">
                    <span class="difficulty">{{ currentQuiz.difficulty }}</span>
                    <span class="topic">{{ currentQuiz.topic }}</span>
                </div>
            </div>

            <div class="quiz-content">
                <p class="quiz-text">{{ currentQuiz.quiz }}</p>
            </div>
        </SingleBox>

        <div v-else class="loading">
            {{ isLoading ? "문제 생성 중..." : "문제를 불러오는 중..." }}
        </div>

        <div v-if="currentQuiz && !isLoading" class="quiz-actions">
            <MultiButton
                :buttons="
                    isLoggedIn
                        ? QUIZ_BUTTONS
                        : QUIZ_BUTTONS.filter((btn) => btn.value !== QUIZ_BUTTON.LEARN)
                "
                @button-click="handleButtonClick"
                :selected-button="selectedButton"
                :disabled-buttons="isLearnCompleted ? [QUIZ_BUTTON.LEARN] : []"
            />
        </div>

        <SingleBox
            v-if="selectedButtonValue && currentQuiz && !isLoading"
            variant="outlined"
            class="answer-box"
        >
            <div class="answer-content">
                <p class="answer-text">
                    {{
                        selectedButtonValue === QUIZ_BUTTON.HINT
                            ? currentQuiz.hint
                            : currentQuiz.answer
                    }}
                </p>
            </div>
        </SingleBox>
    </div>
</template>

<style scoped>
.quiz-play-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
}

.quiz-box {
    width: 100%;
    max-width: 800px;
}

.quiz-header {
    margin-bottom: 2rem;
}

.quiz-info {
    display: flex;
    gap: 1rem;
    justify-content: center;
    font-size: 1.1rem;
}

.difficulty {
    color: var(--button-primary);
    font-weight: 600;
}

.topic {
    color: var(--text-color);
}

.quiz-content {
    text-align: center;
}

.quiz-text {
    font-size: 1.5rem;
    line-height: 1.6;
    color: var(--text-color);
    word-break: keep-all;
    white-space: pre-line;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: var(--text-color);
}

.quiz-actions {
    width: 100%;
    max-width: 800px;
    display: flex;
    justify-content: center;
}

.answer-box {
    width: 100%;
    max-width: 800px;
}

.answer-content {
    text-align: center;
}

.answer-text {
    font-size: 1.2rem;
    line-height: 1.6;
    color: var(--text-color);
    word-break: keep-all;
    white-space: pre-line;
}

@media (max-width: 768px) {
    .quiz-text {
        font-size: 1.2rem;
    }

    .quiz-info {
        font-size: 1rem;
    }

    .answer-text {
        font-size: 1rem;
    }
}
</style>
