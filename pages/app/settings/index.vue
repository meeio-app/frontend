<template>
    <div class="flex flex-col gap-y-8">
        <HeaderWithCaption
            title="My profile"
            caption="Customize your personal informations"
        />
        <UForm
            :state="profileFormData"
            :schema="profileSchema"
            :validate-on="['submit']"
            class="flex flex-col gap-y-6"
            @submit="saveProfile"
        >
            <SettingsParameterEntry
                label="Email"
                caption="Used to login and receive notifications"
            >
                <UFormGroup name="email">
                    <UInput
                        v-model="profileFormData.email"
                        type="email"
                        icon="i-tabler-mail"
                    />
                </UFormGroup>
            </SettingsParameterEntry>

            <SettingsParameterEntry
                label="Username"
                caption="Your unique identifier used to login"
            >
                <UFormGroup name="username">
                    <UInput
                        v-model="profileFormData.username"
                        icon="i-tabler-user"
                    />
                </UFormGroup>
            </SettingsParameterEntry>

            <UButton
                class="self-end"
                label="Save"
                icon="i-tabler-device-floppy"
                type="submit"
            />
        </UForm>

        <UDivider />

        <HeaderWithCaption
            title="Security"
            caption="Customize your personal informations"
        />

        <UForm
            :state="securityFormData"
            :schema="securitySchema"
            :validate-on="['submit']"
            class="flex flex-col gap-y-6"
            @submit="saveSecurity"
        >
            <SettingsParameterEntry
                label="Password"
                caption="Used to securely login to your account"
            >
                <div class="flex flex-col gap-y-3">
                    <UFormGroup name="password">
                        <UInput
                            v-model="securityFormData.password"
                            icon="i-tabler-lock"
                            placeholder="Current password"
                            type="password"
                        />
                    </UFormGroup>

                    <UFormGroup name="passwordConfirm">
                        <UInput
                            v-model="securityFormData.passwordConfirm"
                            icon="i-tabler-lock"
                            placeholder="New password"
                            type="password"
                        />
                    </UFormGroup>
                </div>
            </SettingsParameterEntry>
            <UButton
                class="self-end"
                label="Save"
                icon="i-tabler-device-floppy"
                type="submit"
            />
        </UForm>

        <UDivider />

        <UAlert
            title="Danger zone"
            icon="i-tabler-alert-triangle"
            description="Permanently delete your account with all your data"
            color="red"
            variant="subtle"
            :actions="deleteAccountActions"
        />
    </div>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent, AlertAction } from "#ui/types";
import { ModalDeleteAccount } from "#components";

definePageMeta({
    name: "settings-account"
});

useHead({
    title: "Account"
});

const authStore = useAuthStore();
const modal = useModal();
const repository = useRepository();
const validationRule = useValidationRule();

// Profile section
const profileSchema = z.object({
    email: validationRule.email,
    username: validationRule.username,
});

type ProfileSchema = z.output<typeof profileSchema>;

const profileFormData = reactive<ProfileSchema>({
    email: safeValue(authStore.user?.email, ""),
    username: safeValue(authStore.user?.username, ""),
});

const saveProfile = async (event: FormSubmitEvent<ProfileSchema>) =>
{
    const response = await repository.user.partialUpdateMe({
        email: event.data.email,
        username: event.data.username
    });

    authStore.user = response;

    useStandardToast("success", {
        description: "Settings saved"
    });
};

// Security section
const securitySchema = z
    .object({
        password: validationRule.password,
        passwordConfirm: validationRule.password,
    })
    .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
        message: "Passwords don't match",
        path: ["passwordConfirm"] // path of error
    }); ;

type SecuritySchema = z.output<typeof securitySchema>;

const securityFormData = reactive<SecuritySchema>({
    password: "",
    passwordConfirm: "",
});

const saveSecurity = async () =>
{
    try
    {
        await repository.user.partialUpdateMe({
            rawPassword: securityFormData.password,
        });

        useStandardToast("success", {
            description: "Settings saved"
        });
    }
    finally
    {
        securityFormData.password = "";
        securityFormData.passwordConfirm = "";
    }
};

const deleteAccountActions: AlertAction[] = [
    {
        label: "Delete my account",
        icon: "i-tabler-trash",
        color: "red",
        variant: "solid",
        click: () =>
        {
            modal.open(ModalDeleteAccount);
        }
    },
];
</script>
