import { AbstractRepository } from "./AbstractRepository";
import type { UserRequest, UserResponse } from "~/types/entity";
import type { SettingName } from "~/types/settings";

export class UserRepository extends AbstractRepository
{
    async findMe()
    {
        return this.fetch<UserResponse>(`/users/me`, {
            method: "GET"
        });
    };

    async deleteMe()
    {
        return this.fetch<null>(`/users/me`, {
            method: "DELETE"
        });
    };

    async partialUpdateMe(updatedElement: Partial<UserRequest>)
    {
        return this.fetch<UserResponse>(`/users/me`, {
            method: "PATCH",
            body: {
                ...updatedElement
            }
        });
    };

    async updateMe(updatedElement: UserRequest)
    {
        return this.partialUpdateMe(updatedElement);
    };

    async updateSetting(name: SettingName, value: string | number | boolean)
    {
        return this.fetch<UserResponse>(`/users/settings`, {
            method: "POST",
            body: {
                name,
                value
            }
        });
    };
}
