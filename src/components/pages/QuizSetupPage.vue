<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import SingleButton from "@components/buttons/SingleButton.vue";

import { generateQuiz } from "@api/services/ollamaService";

import { EDUCATION_STAGE, GRADE } from "@constants";

import type { IQuizData, IButtonOption } from "@types";

/* 타입 정의 */
type NavigationQuery = {
    [key: string]: string;
    stage: string;
    grade: string;
};

/* 상수 정의 */
const BUTTON_COLOR = "white" as const;

const STAGE_BUTTONS: IButtonOption[] = [
    { label: EDUCATION_STAGE.ELEMENTARY, value: EDUCATION_STAGE.ELEMENTARY, color: BUTTON_COLOR },
    { label: EDUCATION_STAGE.MIDDLE, value: EDUCATION_STAGE.MIDDLE, color: BUTTON_COLOR },
    { label: EDUCATION_STAGE.HIGH, value: EDUCATION_STAGE.HIGH, color: BUTTON_COLOR },
];

const GRADE_BUTTONS: IButtonOption[] = [
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

const navigateToQuiz = async (): Promise<void> => {
    if (!selectedStage.value || !selectedGrade.value) {
        alert("교육 단계와 학년을 모두 선택해 주세요!");
        return;
    }

    try {
        isLoading.value = true;

        const quizData: IQuizData = await generateQuiz(selectedStage.value, selectedGrade.value);

        const query: NavigationQuery = {
            stage: selectedStage.value,
            grade: selectedGrade.value,
        };

        sessionStorage.setItem("currentQuiz", JSON.stringify(quizData));

        router.push({ path: "/quiz/play", query });
    } catch (error) {
        console.error("퀴즈 생성 실패:", error);
        alert("문제 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="container">
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
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.main-text {
    font-size: 30px;
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
