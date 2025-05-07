import { createRouter, createWebHashHistory } from "vue-router";

import {
    MainPage,
    QuizSetupPage,
    QuizPlayPage,
    FortunePage,
    LoginPage,
    ProfilePage,
    RegisterPage,
} from "@/pages";

import { ROUTE_PATH } from "@/common";

const routes = [
    {
        path: `/${ROUTE_PATH.HOME}`,
        name: "MainPage",
        component: MainPage,
    },
    {
        path: `/${ROUTE_PATH.QUIZ}`,
        name: "QuizSetupPage",
        component: QuizSetupPage,
    },
    {
        path: `/${ROUTE_PATH.QUIZ}/play`,
        name: "QuizPlayPage",
        component: QuizPlayPage,
        props: (route: any) => ({
            stage: route.query.stage,
            grade: route.query.grade,
        }),
    },
    { path: `/${ROUTE_PATH.FORTUNE}`, name: "FortunePage", component: FortunePage },
    { path: `/${ROUTE_PATH.LOGIN}`, name: "LoginPage", component: LoginPage },
    { path: `/${ROUTE_PATH.PROFILE}`, name: "ProfilePage", component: ProfilePage },
    { path: `/${ROUTE_PATH.REGISTER}`, name: "RegisterPage", component: RegisterPage },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
