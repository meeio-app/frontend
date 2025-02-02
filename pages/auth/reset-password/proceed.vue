<template>
    <NuxtLayout name="auth">
        <template #header>
            <AuthHeader
                title="Oups, I forgot my password"
                subtitle="The token sent by email is valid for 10 minutes. Fill the token and your new password to finalize the process."
            />
        </template>
        <UForm
            :schema="schema"
            :state="formData"
            class="flex flex-col gap-y-6"
            :validate-on="['submit']"
            @submit="onSubmit"
        >
            <UFormGroup
                required
                label="Token"
                name="token"
            >
                <UInput
                    v-model="formData.token"
                    autofocus
                    type="password"
                    placeholder="Enter the token sent by email"
                    icon="i-tabler-key"
                />
            </UFormGroup>
            <UFormGroup
                required
                label="Password"
                name="password"
            >
                <UInput
                    v-model="formData.password"
                    type="password"
                    placeholder="New password"
                    icon="i-tabler-lock"
                />
            </UFormGroup>
            <UFormGroup
                required
                label="Password confirmation"
                name="passwordConfirm"
            >
                <UInput
                    v-model="formData.passwordConfirm"
                    type="password"
                    placeholder="Confirm your password"
                    icon="i-tabler-lock"
                />
            </UFormGroup>

            <UButton
                type="submit"
                block
                :loading="formProvider.loadingForm"
            >
                Reset my password
            </UButton>
        </UForm>

        <template #footer>
            <AuthBackToLoginPage class="text-center" />
        </template>
    </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from "zod";

definePageMeta({
    name: "reset-password-proceed",
    middleware: ["guest"]
});

const authStore = useAuthStore();
const repository = useRepository();
const validationRule = useValidationRule();

// Form definition
const schema = z
    .object({
        token: validationRule.token,
        password: validationRule.password,
        passwordConfirm: validationRule.password
    })
    .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
        message: "Passwords don't match",
        path: ["passwordConfirm"] // path of error
    });

const formProvider = reactive({
    loadingForm: false
});

const formData = reactive({
    token: "",
    password: "",
    passwordConfirm: "",
});

const onSubmit = async () =>
{
    try
    {
        formProvider.loadingForm = true;

        const data = await repository.auth.proceedResetPassword({
            token: formData.token,
            rawPassword: formData.password
        });

        authStore.login(data);
        useStandardToast("success", {
            description: "Your password has beed reset successfully"
        });

        await redirectToForwardedRoute("overview");
    }
    finally
    {
        formProvider.loadingForm = false;
    }
};
</script>
