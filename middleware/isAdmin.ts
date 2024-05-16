export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    if (!authStore.isConnected) {
        useStandardToast("unauthorized", {
            description: "You must login before accessing this page"
        });
        return navigateTo({
            name: "login"
        });
    } else if (!authStore.isAdmin) {
        useStandardToast("forbidden", {
            description: "You can now access this page"
        });
        return navigateTo({
            name: "dashboard"
        });
    }
});
