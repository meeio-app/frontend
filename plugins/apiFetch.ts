export default defineNuxtPlugin(() =>
{
    const config = useRuntimeConfig().public;
    const token = useToken();

    const $apiFetch = $fetch.create({
        baseURL: config.apiBaseUrl,
        keepalive: true,
        retry: false,
        headers: {
            "Content-Type": "application/json+std"
        },
        onRequest({ options })
        {
            if (token.value)
            {
                options.headers.append("Authorization", `Bearer ${token.value}`);
            }
        },
        onRequestError()
        {
            // useStandardToast("error", {
            //     description: "An error occured while send a request, please try again or contact the administrator."
            // });
        },
        onResponseError()
        {
            // if (response.status === 500)
            // {
            //     useStandardToast("error");
            // }

            // TODO Gestion globale des erreurs
            // useStandardToast("error");
        }
    });

    return {
        provide: {
            apiFetch: $apiFetch
        }
    };
});
