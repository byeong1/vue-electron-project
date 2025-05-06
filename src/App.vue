<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import NavBar from "@components/navigation/NavBar.vue";
import { isLoggedIn, updateLoginStatus } from "@/stores/auth";
import { isDarkMode, toggleDarkMode } from "@/stores/theme";
import "@/styles/common.css";

const router = useRouter();
const route = useRoute();

/* 탭 선택 시 사용 될 값 */
const tapValue = {
    HOME: "main",
    QUIZ: "quiz",
    FORTUNE: "fortune",
    PROFILE: "profile",
    REGISTER: "register",
    LOGIN: "login",
};

watch(
    () => localStorage.getItem("access_token"),
    (newToken) => {
        updateLoginStatus(!!newToken);
    },
);

const mainTabs = computed(() => [
    { label: "홈", value: tapValue.HOME, icon: "📝" },
    { label: "문제 풀기", value: tapValue.QUIZ, icon: "✏️" },
    { label: "운세 보기", value: tapValue.FORTUNE, icon: "🎯" },
    { label: "테마 모드", value: "theme", icon: isDarkMode.value ? "🌙" : "☀️" },
]);

const selectedTab = ref(tapValue.HOME);

/* 라우트 변경 시 탭 상태 동기화 */
watch(
    () => route.path,
    (path) => {
        if (path === `/${tapValue.HOME}`) selectedTab.value = tapValue.HOME;
        else if (path.startsWith(`/${tapValue.QUIZ}`)) selectedTab.value = tapValue.QUIZ;
        else if (path.startsWith(`/${tapValue.FORTUNE}`)) selectedTab.value = tapValue.FORTUNE;
        else if (path.startsWith(`/${tapValue.PROFILE}`)) selectedTab.value = tapValue.PROFILE;
    },
    { immediate: true },
);

/* 탭 클릭 시 라우팅 */
const onTabChange = (value: string): void => {
    selectedTab.value = value;
    if (value === tapValue.HOME) router.push(`/`);
    else if (value === tapValue.QUIZ) router.push(`/${tapValue.QUIZ}`);
    else if (value === tapValue.FORTUNE) router.push(`/${tapValue.FORTUNE}`);
    else if (value === tapValue.PROFILE) router.push(`/${tapValue.PROFILE}`);
    else if (value === tapValue.LOGIN) router.push(`/${tapValue.LOGIN}`);
    else if (value === tapValue.REGISTER) router.push(`/${tapValue.REGISTER}`);
};

const handleLogout = async () => {
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem("access_token");
    // 로그인 상태 업데이트
    updateLoginStatus(false);
    // 메인 페이지로 이동
    await router.push(`/${tapValue.HOME}`);
};

const handleLogin = () => {
    router.push(`/${tapValue.PROFILE}`);
};

const handleRegister = () => {
    router.push(`/${tapValue.REGISTER}`);
};

const handleMyProfile = () => {
    router.push(`/${tapValue.PROFILE}`);
};

// 새로운 핸들러 함수들
const handleMainButton = () => {
    if (isLoggedIn.value) {
        handleMyProfile();
    } else {
        handleLogin();
    }
};

const handleSecondaryButton = () => {
    if (isLoggedIn.value) {
        handleLogout();
    } else {
        handleRegister();
    }
};

router.push(`/${tapValue.HOME}`);
</script>

<template>
    <div class="app-container">
        <NavBar
            :tabs="mainTabs"
            :selected-tab="selectedTab"
            @tab-change="onTabChange"
            :is-logged-in="isLoggedIn"
            :is-dark-mode="isDarkMode"
            @toggle-theme="toggleDarkMode"
            @logout="handleLogout"
        />
        <main class="main-content">
            <router-view />
        </main>
    </div>
</template>

<style>
.app-container {
    min-height: 100vh;
    background-color: var(--bg-color);
    transition: all 0.3s ease;
    padding-top: 0;
}

.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: calc(100vh - 80px);
}

/* Reset default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--bg-color);
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

@media (max-width: 768px) {
    .main-content {
        padding: 20px;
    }
}
</style>
