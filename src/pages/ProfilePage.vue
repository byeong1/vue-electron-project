<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { getUserInfo, updateUserInfo } from "@/apis";

import { getAccessToken, getErrorMessage, ROUTE_PATH, EDUCATION_STAGE, GRADE } from "@/common";

const router = useRouter();

const accountId = ref("");
const userName = ref("");
const grade = ref("");
const stage = ref("");
const learningQuizs = ref<any[]>([]);

const isEdit = ref(false);
const showEditModal = ref(false);

const editUserName = ref("");
const editGrade = ref("");
const editStage = ref("");

const stageOptions: string[] = Object.values(EDUCATION_STAGE);
const gradeOptions: string[] = Object.values(GRADE);

const fetchUserInfo = async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        router.push(`/${ROUTE_PATH.LOGIN}`);
        return;
    }

    try {
        const userInfo = await getUserInfo(accessToken);
        accountId.value = userInfo.accountId;
        userName.value = userInfo.userName;
        grade.value = userInfo.grade;
        stage.value = userInfo.stage;
        learningQuizs.value = userInfo.learningQuizs || [];

        // 이미 로그인된 상태라면 메인 페이지로 이동
        if (router.currentRoute.value.path === `/${ROUTE_PATH.LOGIN}`) {
            router.push(`/${ROUTE_PATH.HOME}`);
        }
    } catch (error) {
        alert(getErrorMessage("유저 정보 조회에 실패했습니다. 다시 로그인 해주세요."));
        router.push(`/${ROUTE_PATH.LOGIN}`);
    }
};

onMounted(fetchUserInfo);

const removeQuiz = (index: number) => {
    learningQuizs.value.splice(index, 1);
};

const handleEdit = () => {
    isEdit.value = true;
    editUserName.value = userName.value;
    editGrade.value = grade.value;
    editStage.value = stage.value;
};

const confirmEdit = async () => {
    showEditModal.value = false;
    await handleEditDone();
};

const cancelEdit = () => {
    showEditModal.value = false;
};

const handleEditDone = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    await updateUserInfo(accessToken, {
        userName: editUserName.value,
        grade: editGrade.value,
        stage: editStage.value,
    });

    await fetchUserInfo();
    isEdit.value = false;
    alert("수정이 완료되었습니다.");
};
</script>

<template>
    <div class="profile-page">
        <div class="profile-content">
            <!-- 좌측: 사용자 정보 카드 -->
            <SingleBox variant="outlined" class="user-info-box">
                <h2 class="section-title">사용자 정보</h2>
                <div class="info-list">
                    <div class="info-item">
                        <strong>아이디:</strong>
                        <span>{{ accountId }}</span>
                    </div>
                    <div class="info-item">
                        <strong>이름:</strong>
                        <template v-if="isEdit">
                            <input v-model="editUserName" class="common-input" />
                        </template>
                        <template v-else>
                            <span>{{ userName }}</span>
                        </template>
                    </div>
                    <div class="info-item">
                        <strong>교육 단계:</strong>
                        <template v-if="isEdit">
                            <select v-model="editStage" class="common-input">
                                <option
                                    v-for="option in stageOptions"
                                    :key="option"
                                    :value="option"
                                >
                                    {{ option }}
                                </option>
                            </select>
                        </template>
                        <template v-else>
                            <span>{{ stage }}</span>
                        </template>
                    </div>
                    <div class="info-item">
                        <strong>학년:</strong>
                        <template v-if="isEdit">
                            <select v-model="editGrade" class="common-input">
                                <option
                                    v-for="option in gradeOptions"
                                    :key="option"
                                    :value="option"
                                >
                                    {{ option }}
                                </option>
                            </select>
                        </template>
                        <template v-else>
                            <span>{{ grade }}</span>
                        </template>
                    </div>
                </div>

                <div class="button-group">
                    <button v-if="!isEdit" class="common-button secondary" @click="handleEdit">
                        수정
                    </button>
                    <template v-else>
                        <button class="common-button primary" @click="showEditModal = true">
                            수정완료
                        </button>
                        <button class="common-button secondary" @click="isEdit = false">
                            취소
                        </button>
                    </template>
                </div>
            </SingleBox>

            <!-- 우측: 학습 문제 카드 -->
            <SingleBox variant="outlined" class="learning-box">
                <h2 class="section-title">학습 문제</h2>
                <div class="quiz-list">
                    <div v-if="learningQuizs.length === 0" class="empty-state">
                        학습 문제가 없습니다.
                    </div>
                    <div v-else class="quiz-items">
                        <div v-for="(quiz, idx) in learningQuizs" :key="idx" class="quiz-item">
                            <p class="quiz-text">{{ quiz.quiz }}</p>
                            <button class="delete-button" @click="removeQuiz(idx)">삭제</button>
                        </div>
                    </div>
                </div>
            </SingleBox>
        </div>

        <!-- 수정 확인 모달 -->
        <div v-if="showEditModal" class="modal-backdrop">
            <SingleBox variant="outlined" class="modal-box">
                <p class="modal-text">
                    학습 단계 또는 학년 수정 시 ( 이름 제외 ) 기존 <b>{{ stage }}</b
                    >-<b>{{ grade }}</b> 문제의 학습 데이터가 삭제됩니다.<br />
                    정말 수정하시겠습니까?
                </p>
                <div class="button-group">
                    <button class="common-button primary" @click="confirmEdit">수정 완료</button>
                    <button class="common-button secondary" @click="cancelEdit">수정 취소</button>
                </div>
            </SingleBox>
        </div>
    </div>
</template>

<style scoped>
.profile-page {
    width: 100%;
}

.profile-content {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 2rem;
    text-align: center;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item strong {
    color: var(--text-color);
    font-size: 0.9rem;
    opacity: 0.8;
}

.info-item span {
    color: var(--text-color);
    font-size: 1.1rem;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.quiz-list {
    min-height: 200px;
}

.empty-state {
    text-align: center;
    color: var(--text-color);
    opacity: 0.7;
    padding: 2rem;
}

.quiz-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.quiz-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--button-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.quiz-text {
    flex: 1;
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.5;
}

.delete-button {
    padding: 0.5rem 1rem;
    background: var(--button-primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.delete-button:hover {
    background: var(--button-primary-hover);
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-box {
    width: 90%;
    max-width: 500px;
}

.modal-text {
    text-align: center;
    color: var(--text-color);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
}

@media (max-width: 768px) {
    .profile-content {
        grid-template-columns: 1fr;
        padding: 1rem;
    }

    .section-title {
        font-size: 1.3rem;
    }

    .info-item span {
        font-size: 1rem;
    }

    .quiz-text {
        font-size: 0.9rem;
    }
}
</style>
