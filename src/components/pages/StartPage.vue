<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import SingleButton from "@components/buttons/SingleButton.vue";

import { EDUCATION_STAGE, GRADE } from "@constants";
import { ollamaService } from "@/api/services";
import type { QuizData } from "@/api/types";
import type { ButtonOptionType } from "@/types/components/buttonType";

/* 타입 정의 */
interface NavigationQuery {
    [key: string]: string;
    stage: string;
    grade: string;
}

/* 상수 정의 */
const BUTTON_COLOR = "white" as const;

const STAGE_BUTTONS: ButtonOptionType[] = [
    { label: EDUCATION_STAGE.ELEMENTARY, value: EDUCATION_STAGE.ELEMENTARY, color: BUTTON_COLOR },
    { label: EDUCATION_STAGE.MIDDLE, value: EDUCATION_STAGE.MIDDLE, color: BUTTON_COLOR },
    { label: EDUCATION_STAGE.HIGH, value: EDUCATION_STAGE.HIGH, color: BUTTON_COLOR },
];

const GRADE_BUTTONS: ButtonOptionType[] = [
    { label: GRADE.FIRST, value: GRADE.FIRST, color: BUTTON_COLOR },
    { label: GRADE.SECOND, value: GRADE.SECOND, color: BUTTON_COLOR },
    { label: GRADE.THIRD, value: GRADE.THIRD, color: BUTTON_COLOR },
];

/* 훅 및 상태 정의 */
const router = useRouter();

const selectedStageButton = ref<number | null>(null);
const selectedGradeButton = ref<number | null>(null);
const selectedStage = ref<string | null>(null);
const selectedGrade = ref<string | null>(null);
const isLoading = ref<boolean>(false);

/* 계산된 속성 */
const isStageSelected = computed<boolean>(() => selectedStageButton.value !== null);
const isGradeSelected = computed<boolean>(() => selectedGradeButton.value !== null);
const isGradeSelectorEnabled = computed<boolean>(() => isStageSelected.value);

/* 메서드 */
const handleStageSelect = (index: number, label: string, value: string): void => {
    selectedStage.value = value;
    selectedStageButton.value = index;
    selectedGradeButton.value = null;
    selectedGrade.value = null;
};

const handleGradeSelect = (index: number, label: string, value: string): void => {
    selectedGrade.value = value;
    selectedGradeButton.value = index;
};

const generateQuiz = async (): Promise<QuizData> => {
    try {
        const prompt = `<start_of_turn>system
너는 이제부터 한국의 ${selectedStage.value} ${selectedGrade.value}학년 수학 선생님이야.
학생들이 이해하기 쉽고 재미있는 수학 문제를 만들어줘.
<end_of_turn>

<start_of_turn>user
다음 조건에 맞는 수학 문제를 생성해줘:

1. 문제 난이도: ${selectedStage.value} ${selectedGrade.value}학년 수준에 맞게 설정
2. 문제 내용: 
   - 명확하고 이해하기 쉬운 문장으로 작성
   - 필요한 정보는 모두 포함
3. 힌트:
   - 문제를 푸는 방법을 단계별로 설명
   - 수학적 개념을 쉽게 설명
4. 정답:
   - 정확한 숫자와 단위를 포함
   - 정확한 정답만 제시

반드시 다음 JSON 형식으로 응답해줘:
{
    "quiz": "생성된 문제 내용",
    "hint": "생성된 힌트 내용",
    "answer": "생성된 문제의 정답",
    "difficulty": "easy|medium|hard"
}
<end_of_turn>

<start_of_turn>model
문제를 생성하기 전에 다음을 확인해줘:
1. 문제의 정확성
2. 난이도의 적절성
3. 정답의 정확성
4. 힌트의 유용성
<end_of_turn>`;

        const response = await ollamaService.generateText(prompt);
        return JSON.parse(response.response) as QuizData;
    } catch (error) {
        console.error("퀴즈 생성 실패:", error);
        throw new Error("문제 생성에 실패했습니다.");
    }
};

const navigateToQuiz = async (): Promise<void> => {
    if (!selectedStage.value || !selectedGrade.value) {
        alert("교육 단계와 학년을 모두 선택해 주세요!");
        return;
    }

    try {
        isLoading.value = true;
        const quizData = await generateQuiz();

        const query: NavigationQuery = {
            stage: selectedStage.value,
            grade: selectedGrade.value,
        };

        /* 퀴즈 데이터를 세션 스토리지에 저장 */
        sessionStorage.setItem("currentQuiz", JSON.stringify(quizData));

        router.push({ path: "/quiz", query });
    } catch (error) {
        alert("문제 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <h1>시작 화면</h1>
    <SingleBox :width="500" :height="700">
        <div class="container">
            <h2>Vue.js 수학 문제 생성 AI 프로젝트</h2>
            <div class="main-text">교육 단계 / 학년을 선택하세요!</div>

            <MultiButton
                class="stage-selector"
                :buttons="STAGE_BUTTONS"
                @button-click="handleStageSelect"
                :selected-button="selectedStageButton"
            />

            <MultiButton
                v-if="isGradeSelectorEnabled"
                class="grade-selector"
                :buttons="GRADE_BUTTONS"
                @button-click="handleGradeSelect"
                :selected-button="selectedGradeButton"
            />

            <SingleButton
                v-if="isGradeSelected"
                class="create-button"
                color="black"
                :label="isLoading ? '문제 생성 중...' : '문제 생성'"
                :disabled="isLoading"
                @click="navigateToQuiz"
            />
        </div>
    </SingleBox>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.main-text {
    font-size: 40px;
    font-weight: 900;
    border-bottom: 2px solid black;
    margin-bottom: 20px;
    padding-bottom: 30px;
}

.stage-selector,
.grade-selector {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.stage-selector {
    margin-top: 30px;
}

.grade-selector {
    margin-top: 20px;
}

.create-button {
    margin-top: 30px;
}

.stage-selector .button {
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.stage-selector .button.selected {
    background-color: #f39c12;
    color: white;
}

.stage-selector .button:hover {
    background-color: #bdc3c7;
}

@media (max-width: 768px) {
    SingleBox {
        width: 100%;
        max-width: 100%;
        height: auto;
    }
}
</style>
