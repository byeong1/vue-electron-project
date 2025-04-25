<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import SingleButton from "@components/buttons/SingleButton.vue";

import { EDUCATION_STAGE, GRADE } from "@constants";

const router = useRouter();

/* 반응형 상태 정의 */
const selectedStageButton = ref<number | null>(null);
const selectedGradeButton = ref<number | null>(null);
const selectStage = ref<string | null>(null);
const selectGrade = ref<string | null>(null);

/* 계산된 속성 */
const isStageSelected = computed<boolean>(() => selectedStageButton.value !== null);
const isGradeSelected = computed<boolean>(() => selectedGradeButton.value !== null);
const isGradeSelectorEnabled = computed<boolean>(() => isStageSelected.value);

/* 교육 단계 버튼 옵션 */
interface ButtonOption {
    label: string;
    value: string;
    color: string;
}

const stageButtons: ButtonOption[] = [
    { label: EDUCATION_STAGE.ELEMENTARY, value: EDUCATION_STAGE.ELEMENTARY, color: "#3498db" },
    { label: EDUCATION_STAGE.MIDDLE, value: EDUCATION_STAGE.MIDDLE, color: "#2ecc71" },
    { label: EDUCATION_STAGE.HIGH, value: EDUCATION_STAGE.HIGH, color: "#e74c3c" },
];

/* 학년 버튼 옵션 */
const gradeButtons: ButtonOption[] = [
    { label: GRADE.FIRST, value: GRADE.FIRST, color: "#3498db" },
    { label: GRADE.SECOND, value: GRADE.SECOND, color: "#2ecc71" },
    { label: GRADE.THIRD, value: GRADE.THIRD, color: "#e74c3c" },
];

/* 메서드 */
const eduStageButtonSelector = (index: number, label: string, value: string): void => {
    selectStage.value = value;
    selectedStageButton.value = index;
    selectedGradeButton.value = null;
    selectGrade.value = null;
};

const gradeButtonSelector = (index: number, label: string, value: string): void => {
    selectGrade.value = value;
    selectedGradeButton.value = index;
};

const createProblem = (): void => {
    if (selectStage.value && selectGrade.value) {
        alert(`${selectStage.value} - ${selectGrade.value} 문제 생성 중입니다`);

        router.push({
            path: "/quiz",
            query: {
                stage: selectStage.value,
                grade: selectGrade.value,
            },
        });
    } else {
        alert("교육 단계와 학년을 모두 선택해 주세요!");
    }
};
</script>

<template>
    <h1>시작 화면</h1>
    <SingleBox :width="500" :height="700">
        <div class="box-content">
            <h2>Vue.js 수학 문제 생성 AI 프로젝트</h2>

            <div class="main-text">교육 단계 / 학년을 선택하세요!</div>

            <MultiButton
                class="edu-stage-selector"
                :buttons="stageButtons"
                @button-click="eduStageButtonSelector"
                :selected-button="selectedStageButton"
            />

            <MultiButton
                v-if="isGradeSelectorEnabled"
                class="grade-selector"
                :buttons="gradeButtons"
                @button-click="gradeButtonSelector"
                :selected-button="selectedGradeButton"
            />

            <SingleButton
                v-if="isGradeSelected"
                class="create-quiz-button"
                color="black"
                label="문제 생성"
                @click="createProblem"
            />
        </div>
    </SingleBox>
</template>

<style scoped>
.box-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.main-text {
    font-size: 40px;
    border-bottom: 2px solid black;
    margin-bottom: 20px;
    padding-bottom: 30px;
    font-weight: 900;
}

.create-quiz-button {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.edu-stage-selector {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.grade-selector {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.edu-stage-selector .button {
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.edu-stage-selector .button.selected {
    background-color: #f39c12;
    color: white;
}

.edu-stage-selector .button:hover {
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
