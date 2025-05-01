import { ref } from "vue";

export const isDarkMode = ref(localStorage.getItem("darkMode") === "true");

export function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add("dark-mode");
    } else {
        document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", isDarkMode.value ? "true" : "false");
}

// 앱 시작 시 상태 반영
if (isDarkMode.value) {
    document.documentElement.classList.add("dark-mode");
}
