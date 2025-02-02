import { AbstractRepository } from "./AbstractRepository";
import type { Auth, ResetPassword, UserResponse } from "~/types/entity";

export class AuthRepository extends AbstractRepository
{
    async login(authData: Pick<Auth, "identifier" | "rawPassword">)
    {
        return this.fetch<UserResponse>("/auth/login", {
            method: "POST",
            body: {
                identifier: authData.identifier,
                password: authData.rawPassword
            }
        });
    }

    async register(authData: Pick<Auth, "email" | "rawPassword" | "username">)
    {
        return this.fetch<UserResponse>("/auth/register", {
            method: "POST",
            body: {
                email: authData.email,
                username: authData.username,
                rawPassword: authData.rawPassword
            }
        });
    }

    async requestPasswordReset(authData: Pick<ResetPassword, "identifier">)
    {
        return this.fetch<null>("/auth/reset-password/request", {
            method: "POST",
            body: {
                identifier: authData.identifier,
            }
        });
    }

    async proceedResetPassword(authData: Pick<ResetPassword, "token" | "rawPassword">)
    {
        return this.fetch<UserResponse>("/auth/reset-password/proceed", {
            method: "POST",
            body: {
                token: authData.token,
                rawPassword: authData.rawPassword,
            }
        });
    };
}
