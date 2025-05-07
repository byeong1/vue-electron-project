import { ref } from "vue";
import { getAccessToken } from "@/common";

// 로그인 상태를 관리할 ref
export const isLoggedIn = ref(!!getAccessToken());

// 로그인 상태를 업데이트할 함수
export const updateLoginStatus = (status: boolean) => {
    isLoggedIn.value = status;
};
