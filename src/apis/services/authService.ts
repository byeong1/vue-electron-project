import axiosInstance from "@/apis/config";

import type { IAuthRequest, IAuthResponse } from "@/types";

export const login = async (payload: IAuthRequest): Promise<IAuthResponse> => {
    const response = await axiosInstance.post("/api/auth/login", payload);
    return response.data;
};

export const register = async (payload: IAuthRequest): Promise<IAuthResponse> => {
    const response = await axiosInstance.post("/api/auth/register", payload);
    return response.data;
};
