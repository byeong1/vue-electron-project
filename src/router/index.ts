import { createRouter, createWebHistory } from "vue-router";
import StartPage from "@components/pages/StartPage.vue";
import QuizPage from "@components/pages/QuizPage.vue";
import ExplanationPage from "@components/pages/ExplanationPage.vue";

const routes = [
    /* 시작 화면 */
    {
        path: "/",
        name: "Home",
        component: StartPage,
    },
    /* 문제 화면 */
    {
        path: "/quiz",
        name: "QuizPage",
        component: QuizPage,
        props: (route) => ({
            stage: route.query.stage,
            grade: route.query.grade,
        }),
    },
    /* 풀이 화면 */
    {
        path: "/explanation",
        name: "ExplanationPage",
        component: ExplanationPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
