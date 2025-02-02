import { getActivePinia, type Pinia, type Store } from "pinia";
import type { UserResponse } from "~/types/entity";
import type { SettingName } from "~/types/settings";

interface ExtendedPinia extends Pinia
{
    _s: Map<string, Store>;
}

type State = {
    user?: UserResponse;
};

export const useAuthStore = defineStore("auth", {
    state: (): State => ({
        user: undefined
    }),
    actions: {
        logout()
        {
            const token = useToken();
            token.value = null;

            const pinia = getActivePinia() as ExtendedPinia;
            pinia._s.forEach(store => store.$reset());
        },
        login(user: UserResponse)
        {
            const token = useToken();

            token.value = user.token;

            this.user = user;
        },
        setSetting(name: SettingName, value: number | string | boolean)
        {
            if (this.user)
            {
                this.user.settings[name] = value;
            }
        },
        getSetting<T>(name: SettingName)
        {
            return this.user?.settings[name] as T;
        }
    },
    getters: {
        token(state)
        {
            return safeValue(state.user?.token, null);
        },
        isAdmin(state)
        {
            return safeValue(state.user?.roles.includes("ROLE_ADMIN"), false);
        },
        isUser(state)
        {
            return safeValue(state.user?.roles.includes("ROLE_USER"), false);
        },
        isConnected()
        {
            return this.token !== null;
        },
        isPremium(state)
        {
            return safeValue(state.user?.roles.includes("ROLE_PREMIUM"), false);
        }
    }
});
