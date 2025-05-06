import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

import MainPage from "@pages/MainPage.vue";
import QuizSetupPage from "@pages/QuizSetupPage.vue";
import QuizPlayPage from "@pages/QuizPlayPage.vue";
import FortunePage from "@pages/FortunePage.vue";
import LoginPage from "@pages/LoginPage.vue";
import MainAfterLogin from "@pages/MainAfterLogin.vue";
import ProfilePage from "@pages/ProfilePage.vue";
import RegisterPage from "@pages/RegisterPage.vue";

const routes = [
    {
        path: "/",
        component: MainPage,
    },
    {
        path: "/quiz",
        name: "quiz",
        component: QuizSetupPage,
    },
    {
        path: "/quiz/play",
        name: "QuizPlayPage",
        component: QuizPlayPage,
        props: (route: any) => ({
            stage: route.query.stage,
            grade: route.query.grade,
        }),
    },
    { path: "/fortune", name: "FortunePage", component: FortunePage },
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
