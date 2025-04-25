<script lang="ts">
import SingleBox from "@components/boxes/SingleBox.vue";
import MultiBox from "@components/boxes/MultiBox.vue";

import MultiButton from "@components/buttons/MultiButton.vue";

import { EDUCATION_STAGE, GRADE, QUIZ_BUTTON } from "@constants";

export default {
    components: {
        SingleBox,
        MultiBox,
        MultiButton,
    },

    props: {
        stage: {
            type: String,
            default: null,
        },
        grade: {
            type: String,
            default: null,
        },
    },

    created() {
        const isValidStage: boolean = this.stage
            ? Object.values(EDUCATION_STAGE).includes(this.stage)
            : false;

        const isValidGrade: boolean = this.grade
            ? Object.values(GRADE).includes(this.grade)
            : false;

        if (!isValidStage || !isValidGrade) {
            alert("잘못된 요청입니다.");
            this.$router.push("/");
        }
    },

    data() {
        return {
            dummyData: {
                quiz: "사과가 4개 있었는데, 2개를 먹었어요. 남은 사과는 몇 개인가요?",
                hint: "처음에 가진 사과의 수와 먹은 사과의 수를 이용해 남은 수를 빼기로 계산해보세요.",
                answer: "2개",
            },

            QUIZ_BUTTON,
        };
    },
};
</script>

<template>
    <h1>{{ stage }} - {{ grade }} 문제 화면</h1>
    <SingleBox :width="500" :height="700">
        <div>
            <SingleBox class="quiz-box">
                <div class="quiz-text">
                    {{ dummyData.quiz }}
                </div>
            </SingleBox>
            <MultiButton
                class="quiz-button"
                :buttons="[
                    {
                        label: QUIZ_BUTTON.HINT,
                        value: QUIZ_BUTTON.HINT,
                        color: 'white',
                    },
                    {
                        label: QUIZ_BUTTON.ANSWER,
                        value: QUIZ_BUTTON.ANSWER,
                        color: 'white',
                    },
                ]"
                @button-click="eduStageButtonSelector"
                :selected-button="selectedStageButton"
            />
        </div>
    </SingleBox>
</template>

<style scoped>
SingleBox {
    width: 100%; /* Box 컴포넌트가 부모에 맞게 크기를 조정 */
    max-width: 500px; /* 최대 너비 설정 */
    height: auto; /* 높이 비율을 자동으로 유지 */
}

.quiz-text {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center; /* 여러 줄일 때도 가운데 정렬 */
    font-size: 20px; /* 글자 크기 */
    font-weight: 500; /* 약간 부드럽게 */
    padding: 20px; /* 내부 여백 */
    line-height: 1.5; /* 줄 간격 */
    color: #333; /* 글자 색 약간 진하게 */
    word-break: keep-all; /* 단어 단위로 끊기 */
    height: 100%;
    width: 100%;
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 768px) {
    Box {
        width: 100%;
        max-width: 100%; /* 화면 크기에 맞게 너비가 100%로 변하도록 */
        height: auto;
    }
}
</style>
