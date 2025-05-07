import axiosInstance from "@/apis/config";

export const getUserInfo = async (token: string) => {
    const response = await axiosInstance.get("/api/user/info", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateUserInfo = async (token: string, userInfo: any) => {
    const response = await axiosInstance.patch("/api/user/info", userInfo, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
