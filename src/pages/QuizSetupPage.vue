<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import MultiButton from "@components/buttons/MultiButton.vue";
import SingleButton from "@components/buttons/SingleButton.vue";
import SingleBox from "@components/boxes/SingleBox.vue";

import { generateQuizWithAuth, generateQuizWithoutAuth } from "@api/services/ollamaService";
import { getUserInfo } from "@api/services/userService";

import { EDUCATION_STAGE, GRADE } from "@/constants";

import type { IQuizData, IButtonOption } from "@/types";

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

const userName = ref("");
const stage = ref("");
const grade = ref("");

const isComponentMounted = ref(true);

/* 계산된 속성 */
const isStageSelected = computed<boolean>(() => selectedStageButton.value !== null);
const isGradeSelected = computed<boolean>(() => selectedGradeButton.value !== null);

const isGradeSelectorEnabled = computed<boolean>(() => isStageSelected.value);
const isLoggedIn = computed(() => !!localStorage.getItem("access_token"));

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

        let quizData: IQuizData;

        const token = localStorage.getItem("access_token");

        if (token) {
            quizData = await generateQuizWithAuth(selectedStage.value, selectedGrade.value, token);
        } else {
            quizData = await generateQuizWithoutAuth(selectedStage.value, selectedGrade.value);
        }

        // 컴포넌트가 언마운트되었다면 라우팅하지 않음
        if (!isComponentMounted.value) {
            console.log("Component unmounted, ignoring quiz response");
            return;
        }

        const query: NavigationQuery = {
            stage: selectedStage.value,
            grade: selectedGrade.value,
        };

        sessionStorage.setItem("currentQuiz", JSON.stringify(quizData));

        router.push({ path: "/quiz/play", query });
    } catch (error) {
        if (isComponentMounted.value) {
            console.error("퀴즈 생성 실패:", error);
            alert("문제 생성에 실패했습니다. 다시 시도해주세요.");
        }
    } finally {
        if (isComponentMounted.value) {
            isLoading.value = false;
        }
    }
};

const checkLoginAndAutoGenerate = async (): Promise<void> => {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
        const userInfo = await getUserInfo(token);
        userName.value = userInfo.userName;
        stage.value = userInfo.stage;
        grade.value = userInfo.grade;

        if (userInfo.stage && userInfo.grade) {
            selectedStage.value = userInfo.stage;
            selectedGrade.value = userInfo.grade;

            // 버튼 인덱스 설정
            selectedStageButton.value = STAGE_BUTTONS.findIndex(
                (btn) => btn.value === userInfo.stage,
            );
            selectedGradeButton.value = GRADE_BUTTONS.findIndex(
                (btn) => btn.value === userInfo.grade,
            );

            // 자동으로 문제 생성
            await navigateToQuiz();
        }
    } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
    }
};

onMounted(() => {
    checkLoginAndAutoGenerate();
});

onUnmounted(() => {
    isComponentMounted.value = false;
});
</script>

<template>
    <div class="quiz-setup-page">
        <SingleBox variant="outlined" class="setup-box">
            <h1 class="title">교육 단계 / 학년을 선택하세요!</h1>
            <p v-if="!isLoggedIn" class="subtitle">
                AI에게 문제를 학습시키기 위해서는 <span class="highlight">로그인</span>이
                필요합니다.
            </p>
            <div v-if="isLoading" class="notice loading-notice">
                <div class="notice-text">
                    <template v-if="isLoggedIn">
                        <span class="highlight">{{ userName }}</span
                        >님의 학습 정보 (<span class="highlight">{{ stage }} {{ grade }}</span
                        >)에 맞춰 문제를 생성하고 있습니다.
                    </template>
                    <template v-else> 문제를 생성하고 있습니다. </template>
                </div>
                <div class="sub-notice">잠시만 기다려주세요...</div>
            </div>
            <div class="selector-container">
                <MultiButton
                    class="stage-selector"
                    :buttons="STAGE_BUTTONS"
                    @button-click="handleStageSelect"
                    :selected-button="selectedStageButton"
                    :disabled-buttons="isLoading ? STAGE_BUTTONS.map((btn) => btn.value) : []"
                />
                <MultiButton
                    v-if="isGradeSelectorEnabled"
                    class="grade-selector"
                    :buttons="GRADE_BUTTONS"
                    @button-click="handleGradeSelect"
                    :selected-button="selectedGradeButton"
                    :disabled-buttons="isLoading ? GRADE_BUTTONS.map((btn) => btn.value) : []"
                />
            </div>
            <div class="create-button-container">
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
    </div>
</template>

<style scoped>
.quiz-setup-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 20px;
    min-height: calc(100vh - 100px);
}

.title {
    font-size: 2rem;
    font-weight: 900;
    color: var(--text-color);
    text-align: center;
    margin: 0;
    transition: color 0.3s ease;
}

.subtitle {
    text-align: center;
    color: var(--text-secondary, #b0b0b0);
    font-size: 1.15rem;
    font-weight: 600;
    margin: 2rem 0 2.5rem 0;
    line-height: 1.6;
    letter-spacing: 0.2px;
}

.setup-box {
    width: 100%;
    max-width: 800px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.notice-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    margin-top: 2rem;
}

.notice {
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    text-align: center;
    transition: all 0.3s ease;
}

.login-notice {
    background-color: var(--button-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-color);
}

.loading-notice {
    background-color: var(--button-secondary);
    border: 1px solid var(--button-primary);
    color: var(--text-color);
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.notice-text {
    margin-bottom: 0.5rem;
}

.sub-notice {
    font-size: 0.9rem;
    opacity: 0.7;
}

.highlight {
    color: var(--button-primary);
    font-weight: 600;
}

.selector-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.selector-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 1rem;
}

.create-button-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.create-button {
    width: 200px;
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background-color: var(--button-primary);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
}

.create-button::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition:
        width 0.6s ease,
        height 0.6s ease;
}

.create-button:hover::before {
    width: 300%;
    height: 300%;
}

.create-button:hover {
    background-color: var(--button-primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.create-button:disabled {
    background-color: var(--button-disabled);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.create-button:disabled::before {
    display: none;
}

@media (max-width: 768px) {
    .title {
        font-size: 1.5rem;
    }

    .setup-box {
        padding: 1.5rem;
    }

    .selector-container {
        gap: 1rem;
    }

    .create-button {
        width: 180px;
        padding: 12px 24px;
        font-size: 1rem;
    }
}
</style>
