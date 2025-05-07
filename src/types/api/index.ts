export type IAuthResponse = {
    access_token: string;
};

export type IAuthRequest = {
    accountId: string;
    password: string;
    userName?: string;
    grade?: string;
    stage?: string;
};
