<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import { EDUCATION_STAGE, GRADE, QUIZ_BUTTON } from "@constants";

/* 타입 정의 */
interface QuizData {
    quiz: string;
    hint: string;
    answer: string;
}

interface ButtonOption {
    label: string;
    value: string;
    color: string;
}

/* 상수 정의 */
// TODO: 실제 API 연동 시 @constants/quiz.ts로 이동 예정
const DUMMY_QUIZ: QuizData = {
    quiz: "사과가 4개 있었는데, 2개를 먹었어요. 남은 사과는 몇 개인가요?",
    hint: "처음에 가진 사과의 수와 먹은 사과의 수를 이용해 남은 수를 빼기로 계산해보세요.",
    answer: "2개",
};

const QUIZ_BUTTONS: ButtonOption[] = [
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
        label: QUIZ_BUTTON.BACK,
        value: QUIZ_BUTTON.BACK,
        color: "white",
    },
];

/* 훅 및 상태 정의 */
const router = useRouter();
const route = useRoute();

const selectedButton = ref<number | null>(null);
const selectedButtonValue = ref<string | null>(null);
const stage = ref<string | null>((route.query.stage as string) || null);
const grade = ref<string | null>((route.query.grade as string) || null);

/* 메서드 */
const handleButtonClick = (index: number, label: string, value: string): void => {
    if (value === QUIZ_BUTTON.BACK) {
        router.push("/");
        return;
    } else if (selectedButton.value === index) {
        selectedButton.value = null;
        selectedButtonValue.value = null;
    } else {
        selectedButton.value = index;
        selectedButtonValue.value = value;
    }
};

const validateStageAndGrade = (): boolean => {
    const isValidStage = stage.value ? Object.values(EDUCATION_STAGE).includes(stage.value) : false;
    const isValidGrade = grade.value ? Object.values(GRADE).includes(grade.value) : false;
    return isValidStage && isValidGrade;
};

/* 라이프사이클 훅 */
onMounted(() => {
    if (!validateStageAndGrade()) {
        alert("잘못된 요청입니다.");
        router.push("/");
    }
});
</script>

<template>
    <h1>{{ stage }} - {{ grade }} 문제 화면</h1>
    <SingleBox :width="500" :height="700">
        <div class="container">
            <SingleBox class="quiz-box">
                <div class="quiz-text">
                    {{ DUMMY_QUIZ.quiz }}
                </div>
            </SingleBox>
            <div class="quiz-button">
                <MultiButton
                    :buttons="QUIZ_BUTTONS"
                    @button-click="handleButtonClick"
                    :selected-button="selectedButton"
                />
            </div>
            <SingleBox v-if="selectedButtonValue" class="answer-box">
                <div class="answer-text">
                    {{
                        selectedButtonValue === QUIZ_BUTTON.HINT
                            ? DUMMY_QUIZ.hint
                            : DUMMY_QUIZ.answer
                    }}
                </div>
            </SingleBox>
        </div>
    </SingleBox>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

SingleBox {
    width: 100%;
    max-width: 500px;
    height: auto;
}

.quiz-box {
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
}

@media (max-width: 768px) {
    Box {
        width: 100%;
        max-width: 100%;
        height: auto;
    }
}
</style>
