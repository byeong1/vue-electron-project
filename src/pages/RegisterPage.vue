<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { SingleBox, BaseInput } from "@/components";

import { register } from "@/apis";

import { isDarkMode, toggleDarkMode, updateLoginStatus } from "@/stores";

import type { IAuthResponse } from "@/types";

import { setAccessToken, getErrorMessage, ROUTE_PATH, EDUCATION_STAGE, GRADE } from "@/common";

const router = useRouter();

const accountId = ref("");
const userName = ref("");
const password = ref("");
const grade = ref("");
const stage = ref("");

const isLoading = ref<boolean>(false);

const stageOptions: string[] = Object.values(EDUCATION_STAGE);
const gradeOptions: string[] = Object.values(GRADE);

const validateForm = (): boolean =>
    Boolean(accountId.value && userName.value && password.value && grade.value && stage.value);

const handleRegister = async (): Promise<void> => {
    if (!validateForm()) {
        alert("아이디, 이름, 비밀번호, 학년, 교육 단계를 입력하세요.");
        return;
    }

    isLoading.value = true;

    try {
        const res: IAuthResponse = await register({
            accountId: accountId.value,
            userName: userName.value,
            password: password.value,
            grade: grade.value,
            stage: stage.value,
        });

        setAccessToken(res.access_token);

        updateLoginStatus(true);

        router.push(`/${ROUTE_PATH.QUIZ}`);
    } catch (error) {
        let message = getErrorMessage(error, "회원가입에 실패했습니다.");
        alert(message);
    } finally {
        isLoading.value = false;
    }
};

const goToHome = () => router.push(`/${ROUTE_PATH.HOME}`);
const goToLogin = () => router.push(`/${ROUTE_PATH.LOGIN}`);
</script>

<template>
    <div class="register-page" :class="{ 'dark-mode': isDarkMode }">
        <div class="container">
            <SingleBox class="register-box" :width="479">
                <div class="theme-toggle" @click="toggleDarkMode">
                    <span class="theme-icon">{{ isDarkMode ? "🌙" : "☀️" }}</span>
                </div>
                <div class="home-button" @click="goToHome">
                    <span class="home-icon">📚</span>
                    <span class="home-text">AI 문제은행</span>
                </div>
                <div class="input-group">
                    <BaseInput
                        v-model="accountId"
                        type="text"
                        placeholder="아이디"
                        class="input"
                        :disabled="isLoading"
                    />
                    <BaseInput
                        v-model="userName"
                        type="text"
                        placeholder="이름"
                        class="input"
                        :disabled="isLoading"
                    />
                    <select v-model="stage" class="input" :disabled="isLoading">
                        <option value="" disabled>교육 단계 선택</option>
                        <option v-for="option in stageOptions" :key="option" :value="option">
                            {{ option }}
                        </option>
                    </select>
                    <select v-model="grade" class="input" :disabled="isLoading">
                        <option value="" disabled>학년 선택</option>
                        <option v-for="option in gradeOptions" :key="option" :value="option">
                            {{ option }}
                        </option>
                    </select>
                    <BaseInput
                        v-model="password"
                        type="password"
                        placeholder="비밀번호"
                        class="input"
                        :disabled="isLoading"
                    />
                </div>
                <button class="register-button" @click="handleRegister" :disabled="isLoading">
                    {{ isLoading ? "회원가입 중..." : "회원가입" }}
                </button>
                <button class="login-link" @click="goToLogin" :disabled="isLoading">
                    로그인으로 돌아가기
                </button>
            </SingleBox>
        </div>
    </div>
</template>

<style scoped>
.register-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color, #f5f6f7);
    z-index: 1000;
    transition: all 0.3s ease;
}

.register-page.dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --box-bg: #2d2d2d;
    --border-color: #404040;
    --input-bg: #333333;
    --input-text: #ffffff;
    --button-hover: #c0392b;
    --button-hover-bg: rgba(255, 255, 255, 0.1);
    --placeholder-color: rgba(255, 255, 255, 0.7);
}

.theme-toggle {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    background-color: var(--box-bg, white);
    border: 1px solid var(--border-color, #ddd);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 1001;
}

.theme-toggle:hover {
    transform: translateX(-50%) scale(1.1);
}

.theme-icon {
    font-size: 20px;
}

.home-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    padding: 15px;
    margin-bottom: 30px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.home-button:hover {
    background-color: var(--button-hover-bg, rgba(0, 0, 0, 0.05));
}

.home-icon {
    font-size: 24px;
}

.home-text {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-color, #333);
    transition: color 0.3s ease;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

.register-box {
    position: relative;
    padding: 40px;
    background: var(--box-bg, white);
    border: 1px solid var(--border-color, #ddd);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input-group {
    margin-bottom: 20px;
    width: 100%;
}

.input {
    width: 100%;
    margin: 8px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s;
    box-sizing: border-box;
}

.input:focus {
    border-color: #e74c3c;
    outline: none;
}

select.input {
    background-color: white;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 1em;
    padding-right: 45px;
}

.register-button {
    width: 100%;
    padding: 15px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.register-button:hover:not(:disabled) {
    background: #c0392b;
}

.register-button:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.login-link {
    width: 100%;
    padding: 15px;
    margin-top: 10px;
    background: white;
    color: #e74c3c;
    border: 1px solid #e74c3c;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.login-link:hover:not(:disabled) {
    background: #fff5f5;
}

.login-link:disabled {
    background: #f5f5f5;
    color: #999;
    border-color: #ddd;
    cursor: not-allowed;
}
</style>
