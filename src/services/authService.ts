import { LoginResponseModel } from "@/models/user";
import { ApiRequest } from "@/utils/apiRequest";

export const authenticate = async (username: string, password: string) => {
    const response = await ApiRequest<LoginResponseModel>({
        endpoint: "auth/login",
        method: "post",
        body: password
            ? {
                username,
                password,
            }
            : { username },
    });

    if (!response) {
        return undefined;
    }

    return {
        user: response.user,
        token: response.token,
    };
};
