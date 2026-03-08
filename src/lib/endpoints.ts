export type RequestTypes = "get" | "post" | "put" | "patch" | "delete";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/";

export const ENDPOINTS: Record<
    string,
    {
        methods: RequestTypes[];
        param?: string;
    }
> = {
    "auth/login": {
        methods: ["post"],
        param: undefined,
    },
};
