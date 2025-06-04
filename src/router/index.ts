import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import WeatherUI from "../components/WeatherUI.vue";

import {
    MainPage,
    QuizSetupPage,
    QuizPlayPage,
    FortunePage,
    LoginPage,
    ProfilePage,
    RegisterPage,
    PrinterPage,
} from "@/pages";

import { ROUTE_PATH } from "@/common";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: MainPage,
    },
    {
        path: "/weather",
        name: "weather",
        component: WeatherUI,
    },
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
    { path: `/${ROUTE_PATH.PRINTER}`, name: "PrinterPage", component: PrinterPage },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
