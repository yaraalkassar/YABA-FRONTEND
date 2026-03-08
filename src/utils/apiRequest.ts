import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { API_URL, ENDPOINTS, RequestTypes } from "@/lib/endpoints";

export type QueryParam = {
    key: string;
    value: string | number | boolean;
}[];

export interface RequestOptions {
    endpoint: keyof typeof ENDPOINTS;
    method: RequestTypes;
    queryParams?: QueryParam;
    param?: string | number;
    body?: unknown;
    formData?: FormData;
    reload?: boolean;
    errorMsg?: string;
    apiToken?: string;
    notify?: (payload: { message: string }) => void;
    responseType?: "json" | "blob";
}

export const ApiRequest = async <T>({
    endpoint,
    method,
    body,
    errorMsg,
    param,
    queryParams,
    formData,
    apiToken,
    notify,
    responseType = "json",
}: RequestOptions): Promise<T | undefined> => {
    try {
        let url = `${API_URL}${endpoint}`;

        if (!ENDPOINTS[endpoint].methods.includes(method)) {
            throw new Error(`Method (${method.toUpperCase()}) not allowed on this endpoint: ${url}`);
        }

        if (ENDPOINTS[endpoint].param && !param) {
            throw new Error(`Parameter is required on this endpoint: ${url}`);
        }

        if (ENDPOINTS[endpoint].param && param) {
            url = url.replace(String(ENDPOINTS[endpoint].param), String(param));
        }

        const headers = new Headers();
        headers.append("Access-Control-Allow-Origin", "*");

        if (body) {
            headers.append("Content-Type", "application/json");
        }

        if (apiToken) {
            headers.append("authorization", `bearer ${apiToken}`);
        }

        const requestOptions: RequestInit = {
            method: method.toUpperCase(),
            headers,
            cache: "no-cache",
            next: { tags: [endpoint] },
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        } else if (formData) {
            requestOptions.body = formData;
        }

        if (queryParams) {
            const serialized = queryParams.map((p) => `${p.key}=${p.value}`).join("&");
            url += `?${serialized}`;
        }

        const response = await fetch(url, requestOptions);

        if (response.ok) {
            if (responseType === "blob") {
                return (await response.blob()) as T;
            }
            const data = (await response.json()) as { data: T };
            return data.data;
        }

        const error = (await response.json()) as { message?: string; statusCode?: number };
        throw new Error(error.message || "Something went wrong", {
            cause: Number(error.statusCode) || 0,
        });
    } catch (err) {
        const error = err as Error;
        const statusCode = error.cause as number | undefined;

        let message = "Something went wrong";
        if (errorMsg) {
            message = errorMsg;
        } else if (error.message) {
            message = error.message;
        }

        try {
            if (statusCode === 401) {
                if (typeof window !== "undefined") {
                    await signOut({ redirect: false });
                    window.location.href = "/api/auth/signin";
                } else {
                    redirect("/api/auth/signin");
                }
            }

            if (notify) {
                notify({ message });
            }
        } catch {
            if (statusCode === 401) {
                redirect("/api/auth/signin");
            }
            throw new Error(`${statusCode ?? 0} - ${message}`);
        }

        return undefined;
    }
};
