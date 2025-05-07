// 토큰 관련
export const getAccessToken = () => localStorage.getItem("access_token");
export const setAccessToken = (token: string) => localStorage.setItem("access_token", token);

// 에러 메시지 추출
export const getErrorMessage = (error: any, defaultMsg = "오류가 발생했습니다.") => {
    if (error?.response?.data?.message) {
        return Array.isArray(error.response.data.message)
            ? error.response.data.message.join("\n")
            : error.response.data.message;
    }
    return defaultMsg;
};

// 숫자 2자리로 맞추기
export const padZero = (num: string | number) => String(num).padStart(2, "0");

// 날짜 포맷
export const formatDate = (year: string, month: string, day: string) =>
    `${year}-${padZero(month)}-${padZero(day)}`;
