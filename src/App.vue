<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import NavBar from "@components/navigation/NavBar.vue";

const router = useRouter();
const route = useRoute();

const tabs = [
    { label: "홈", value: "quiz", icon: "🏠" },
    { label: "문제 풀기", value: "quizSetup", icon: "🔍" },
    { label: "오늘의 운세", value: "fortune", icon: "❤️" },
    { label: "내정보", value: "profile", icon: "👤" },
];

const selectedTab = ref("quiz");

/* 라우트 변경 시 탭 상태 동기화 */
watch(
    () => route.path,
    (path) => {
        if (path === "/quiz") selectedTab.value = "quiz";
        else if (path.startsWith("/quiz/setup")) selectedTab.value = "quizSetup";
        else if (path.startsWith("/fortune")) selectedTab.value = "fortune";
        else if (path.startsWith("/profile")) selectedTab.value = "profile";
    },
    { immediate: true },
);

/* 탭 클릭 시 라우팅 */
const onTabChange = (value: string): void => {
    selectedTab.value = value;
    if (value === "quiz") router.push("/quiz");
    else if (value === "quizSetup") router.push("/quiz/setup");
    else if (value === "fortune") router.push("/fortune");
    else if (value === "profile") router.push("/profile");
};

router.push("/quiz");
</script>

<template>
    <div class="app-layout">
        <NavBar v-model="selectedTab" :tabs="tabs" @update:modelValue="onTabChange" />
        <div class="main-content">
            <router-view />
        </div>
    </div>
</template>

<style>
html,
body,
#app {
    background-color: antiquewhite;
    min-height: 100vh;
    margin: 0;
    padding: 0;
}

.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: antiquewhite;
}

.main-content {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
}

.logo {
    width: 400px;
    height: 400px;
    object-fit: contain;
    display: block;
    margin: 40px auto 20px auto;
}
</style>
