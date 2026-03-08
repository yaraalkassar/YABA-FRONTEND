export interface LoginUserModel {
    id?: string | number;
    username?: string;
    email?: string;
    name?: string;
    image?: string;
    [key: string]: unknown;
}

export interface LoginResponseModel {
    user: LoginUserModel;
    token: string;
}
