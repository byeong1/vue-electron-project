import { createRouter, createWebHashHistory } from "vue-router";

import MainPage from "@components/pages/MainPage.vue";
import QuizSetupPage from "@components/pages/QuizSetupPage.vue";
import QuizPlayPage from "@components/pages/QuizPlayPage.vue";
import FortunePage from "@components/pages/FortunePage.vue";
import LoginPage from "@components/pages/LoginPage.vue";
import MainAfterLogin from "@components/pages/MainAfterLogin.vue";
import ProfilePage from "@components/pages/ProfilePage.vue";
import RegisterPage from "@components/pages/RegisterPage.vue";

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
    /* 운세 화면 */
    {
        path: "/fortune",
        name: "FortunePage",
        component: FortunePage,
    },
    { path: "/login", name: "LoginPage", component: LoginPage },
    { path: "/main", name: "MainAfterLogin", component: MainAfterLogin },
    { path: "/profile", name: "ProfilePage", component: ProfilePage },
    { path: "/register", name: "RegisterPage", component: RegisterPage },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
