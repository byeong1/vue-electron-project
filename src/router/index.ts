import { createRouter, createWebHistory } from "vue-router";

import MainPage from "@components/pages/MainPage.vue";
import QuizSetupPage from "@components/pages/QuizSetupPage.vue";
import QuizPlayPage from "@components/pages/QuizPlayPage.vue";

const routes = [
    /* 메인 화면 */
    {
        path: "/quiz",
        name: "MainPage",
        component: MainPage,
    },
    /* 문제 선택 화면 */
    {
        path: "/quiz/setup",
        name: "QuizSetupPage",
        component: QuizSetupPage,
    },
    /* 문제 화면 */
    {
        path: "/quiz/play",
        name: "QuizPlayPage",
        component: QuizPlayPage,
        props: (route: any) => ({
            stage: route.query.stage,
            grade: route.query.grade,
        }),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
