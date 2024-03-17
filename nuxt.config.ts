// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        pageTransition: { name: "page", mode: "out-in" }
    },
    devtools: {
        enabled: false
    },
    modules: ["@nuxt/ui", "@vueuse/nuxt"],
    colorMode: {
        preference: "dark"
    },
    tailwindcss: {
        viewer: false
    },
    ssr: false,
    vite: {
        server: {
            hmr: {
                port: 3001
            }
        }
    }
});
