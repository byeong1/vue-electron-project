<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import SingleBox from "@components/boxes/SingleBox.vue";
import { login } from "@api/services/authService";
import { updateLoginStatus } from "@/stores/auth";
import { isDarkMode, toggleDarkMode } from "@/stores/theme";

const router = useRouter();
const accountId = ref("");
const password = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
    if (!accountId.value || !password.value) {
        alert("아이디와 비밀번호를 입력하세요.");
        return;
    }
    isLoading.value = true;
    try {
        const res = await login({
            accountId: accountId.value,
            password: password.value,
        });

        if (res.access_token) {
            localStorage.setItem("access_token", res.access_token);
            updateLoginStatus(true);
            router.push("/quiz");
        } else {
            alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.");
        }
    } catch (e) {
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.");
    } finally {
        isLoading.value = false;
    }
};

const goToHome = () => {
    router.push("/quiz");
};
</script>

<template>
    <div class="login-page" :class="{ 'dark-mode': isDarkMode }">
        <div class="container">
            <SingleBox class="login-box">
                <div class="theme-toggle" @click="toggleDarkMode">
                    <span class="theme-icon">{{ isDarkMode ? "🌙" : "☀️" }}</span>
                </div>
                <div class="home-button" @click="goToHome">
                    <span class="home-icon">📚</span>
                    <span class="home-text">AI 문제은행</span>
                </div>
                <div class="input-group">
                    <input
                        v-model="accountId"
                        type="text"
                        placeholder="아이디"
                        class="input"
                        :disabled="isLoading"
                    />
                    <input
                        v-model="password"
                        type="password"
                        placeholder="비밀번호"
                        class="input"
                        :disabled="isLoading"
                    />
                </div>
                <button class="login-button" @click="handleLogin" :disabled="isLoading">
                    {{ isLoading ? "로그인 중..." : "로그인" }}
                </button>
                <button
                    class="register-link"
                    @click="() => router.push('/register')"
                    :disabled="isLoading"
                >
                    회원가입
                </button>
            </SingleBox>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    position: fixed;
    top: 0;
    left: 0;
    min-height: 100vh;
    width: 100%;
    background-color: var(--bg-color, #f5f6f7);
    z-index: 9999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-page.dark-mode {
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
    transition: all 0.3s ease;
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
    width: 100%;
    padding: 80px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
    position: relative;
    width: 400px;
    padding: 40px;
    background: var(--box-bg, white);
    border: 1px solid var(--border-color, #ddd);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-box h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 24px;
    color: #333;
}

.input-group {
    margin-bottom: 20px;
    width: 100%;
}

.input {
    width: 100%;
    margin: 8px 0;
    padding: 15px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    font-size: 16px;
    background-color: var(--input-bg, white);
    color: var(--input-text, #333);
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.input::placeholder {
    color: var(--placeholder-color, #999);
    transition: color 0.3s ease;
}

.input:focus {
    border-color: #e74c3c;
    outline: none;
}

.login-button {
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

.login-button:hover:not(:disabled) {
    background: #c0392b;
}

.login-button:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.register-link {
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

.register-link:hover:not(:disabled) {
    background: #fff5f5;
}

.register-link:disabled {
    background: #f5f5f5;
    color: #999;
    border-color: #ddd;
    cursor: not-allowed;
}
</style>
