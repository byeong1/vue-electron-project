import axiosInstance from "@api/config";

export interface AuthResponse {
    access_token: string;
}

export interface AuthRequest {
    accountId: string;
    userName?: string;
    password: string;
    grade?: string;
    stage?: string;
}

export const login = async (payload: AuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/api/auth/login", payload);
    return response.data;
};

export const register = async (payload: AuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/api/auth/register", payload);
    return response.data;
};
