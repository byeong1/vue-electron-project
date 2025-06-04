export const ROUTE_PATH = {
    HOME: "",
    LOGIN: "login",
    REGISTER: "register",
    PROFILE: "profile",
    QUIZ: "quiz",
    FORTUNE: "fortune",
    THEME: "theme",
    WEATHER: "weather",
} as const;

export type RoutePath = (typeof ROUTE_PATH)[keyof typeof ROUTE_PATH];
