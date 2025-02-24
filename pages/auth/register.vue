<template>
    <NuxtLayout name="auth">
        <template #header>
            <AuthHeader title="Create an account">
                <template #subtitle>
                    Already have an account?
                    <ULink
                        :to="{ name: 'login', query: route.query }"
                        class="text-primary hover:text-primary-300"
                    >
                        Login
                    </ULink>
                </template>
            </AuthHeader>
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
                label="Username"
                name="username"
            >
                <UInput
                    v-model="formData.username"
                    autofocus
                    placeholder="Enter your username"
                    icon="i-tabler-user"
                />
            </UFormGroup>

            <UFormGroup
                required
                label="Email"
                name="email"
            >
                <UInput
                    v-model="formData.email"
                    placeholder="Enter your email"
                    icon="i-tabler-mail"
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
                    placeholder="Enter your password"
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
                Sign up
            </UButton>
        </UForm>

        <template #footer>
            <AuthAcceptTermsOfUse class="text-center" />
        </template>
    </NuxtLayout>
</template>

<script setup lang="ts">
import { z } from "zod";

definePageMeta({
    name: "register",
    middleware: ["guest"]
});

useHead({
    title: "Register"
});

const authStore = useAuthStore();
const repository = useRepository();
const validationRule = useValidationRule();
const route = useRoute();

// Form definition
const schema = z
    .object({
        username: validationRule.username,
        email: validationRule.email,
        password: validationRule.password,
        passwordConfirm: validationRule.password
    })
    .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
        message: "Passwords must match",
        path: ["passwordConfirm"] // path of error
    });

const formProvider = reactive({
    loadingForm: false
});

const formData = reactive({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
});

const onSubmit = async () =>
{
    try
    {
        formProvider.loadingForm = true;

        const data = await repository.auth.register({
            username: formData.username,
            email: formData.email,
            rawPassword: formData.password
        });

        authStore.login(data);

        await redirectToForwardedRoute("overview");
    }
    finally
    {
        formProvider.loadingForm = false;
    }
};
</script>
