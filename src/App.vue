<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { NavBar } from "@/components";

import { isLoggedIn, updateLoginStatus, isDarkMode, toggleDarkMode } from "@/stores";

import { ROUTE_PATH } from "@/common";

import "@/styles/common.css";

const router = useRouter();
const route = useRoute();

/* access_token 변경 시 로그인 상태 동기화 */
watch(
    () => localStorage.getItem("access_token"),
    (newToken) => {
        updateLoginStatus(!!newToken);
    },
);

const mainTabs = computed(() => [
    { label: "홈", value: ROUTE_PATH.HOME, icon: "📝" },
    { label: "문제 풀기", value: ROUTE_PATH.QUIZ, icon: "✏️" },
    { label: "운세 보기", value: ROUTE_PATH.FORTUNE, icon: "🎯" },
    { label: "테마 모드", value: ROUTE_PATH.THEME, icon: isDarkMode.value ? "🌙" : "☀️" },
]);

const selectedTab = ref(ROUTE_PATH.HOME);

/* 라우트 변경 시 탭 상태 동기화 */
watch(
    () => route.path,
    (path) => {
        if (path === "/" || path === `/${ROUTE_PATH.HOME}`) selectedTab.value = ROUTE_PATH.HOME;
        else if (path.startsWith(`/${ROUTE_PATH.QUIZ}`)) selectedTab.value = ROUTE_PATH.QUIZ;
        else if (path.startsWith(`/${ROUTE_PATH.FORTUNE}`)) selectedTab.value = ROUTE_PATH.FORTUNE;
        else if (path.startsWith(`/${ROUTE_PATH.PROFILE}`)) selectedTab.value = ROUTE_PATH.PROFILE;
        else selectedTab.value = "";
    },
    { immediate: true },
);

/* 탭 클릭 시 라우팅 */
const onTabChange = (value: string): void => {
    selectedTab.value = value;

    if (value === ROUTE_PATH.THEME) return;

    router.push(`/${value}`);
};

const handleLogout = async () => {
    localStorage.removeItem("access_token");

    updateLoginStatus(false);

    await router.push(`/${ROUTE_PATH.HOME}`);
};

/* 앱 진입 시 홈으로 이동 (최초 진입 시에만) */
if (route.path === "/") router.push(`/${ROUTE_PATH.HOME}`);
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
