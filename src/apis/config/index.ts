import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACK_END_SERVER,
    timeout: 3600000,
});

/* 요청 인터셉터 */
axiosInstance.interceptors.request.use(
    (config) => {
        // 요청 전에 수행할 작업
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

/* 응답 인터셉터 */
axiosInstance.interceptors.response.use(
    (response) => {
        // 응답 데이터를 가공할 수 있음
        return response;
    },
    (error) => {
        // 에러 처리
        return Promise.reject(error);
    },
);

export default axiosInstance;
