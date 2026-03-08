import { authenticate } from "@/services/authService";
import NextAuth, { type AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET as string,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        return null;
                    }

                    const res = await authenticate(credentials.username, credentials.password);
                    if (!res) {
                        return null;
                    }

                    return {
                        ...res.user,
                        id: res.user.id ? String(res.user.id) : credentials.username,
                        apiToken: res.token,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            const sanitizedToken = Object.keys(token).reduce<Record<string, unknown>>((p, c) => {
                if (c !== "iat" && c !== "exp" && c !== "jti" && c !== "apiToken") {
                    return { ...p, [c]: token[c as keyof typeof token] };
                }
                return p;
            }, {});

            return { ...session, user: sanitizedToken, token: token.apiToken };
        },
        async jwt({ token, user }) {
            if (typeof user !== "undefined") {
                return user as unknown as JWT;
            }
            return token;
        },
        async redirect({ baseUrl }) {
            return baseUrl;
        },
    },
};

export const handler = NextAuth(authOptions);
