<template>
    <div class="flex flex-col gap-y-8">
        <HeaderWithCaption
            title="Pagination"
            caption="Customize how requests are made"
        />
        <section class="flex flex-col gap-y-6">
            <SettingsParameterEntry
                label="Items per page"
                caption="Specify the number of items per page"
            >
                <USelectMenu
                    v-model="itemsPerPage"
                    :options="itemsPerPageObject"
                    value-attribute="value"
                    option-attribute="label"
                    size="md"
                    @change="updatePagination"
                />
            </SettingsParameterEntry>
        </section>

        <UDivider />

        <HeaderWithCaption
            title="Session"
            caption="Customize your session"
        />
        <section class="flex flex-col gap-y-6">
            <SettingsParameterEntry
                label="Flashcards per session"
                caption="Specify the number of flashcards per session"
            >
                <UInput
                    v-model="flashcardsPerSession"
                    type="number"
                    size="md"
                    @change="updateFlashcardsPerSession"
                />
            </SettingsParameterEntry>

            <SettingsParameterEntry
                label="Reviews per day goal"
                caption="Reach your goal by reviewing flashcards daily"
            >
                <UInput
                    v-model="reviewsPerDayGoal"
                    type="number"
                    size="md"
                    @change="updateReviewsPerDayGoal"
                />
            </SettingsParameterEntry>

            <SettingsParameterEntry
                label="Display session introduction"
                caption="Show the introduction modal before starting a new session"
            >
                <UToggle
                    v-model="showSessionIntroduction"
                    @change="updateShowSessionIntroduction"
                />
            </SettingsParameterEntry>
        </section>

        <UDivider />

        <HeaderWithCaption
            title="Data collection"
            caption="Manage your collection"
        />
        <section>
            <SettingsParameterEntry
                label="Reset your reviews"
                caption="Reset your flashcards state and go bask as you just created them"
            >
                <UButton
                    class="self-start justify-self-start"
                    label="Erase"
                    color="red"
                    @click="eraseReviews"
                />
            </SettingsParameterEntry>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ModalConfirm } from "#components";

definePageMeta({
    name: "settings-general"
});

useHead({
    title: "General"
});

const authStore = useAuthStore();
const repository = useRepository();
const flashcardStore = useFlashcardStore();
const modal = useModal();

const itemsPerPageOptions = [25, 50, 100, 200, 500];
const itemsPerPageObject = itemsPerPageOptions.map((o) =>
{
    return {
        label: o.toString(),
        value: o
    };
});
const itemsPerPage = ref(authStore.getSetting<number>("items_per_page"));
const updatePagination = async () => await setSetting("items_per_page", itemsPerPage.value);

const flashcardsPerSession = ref(authStore.getSetting<number>("flashcard_per_session"));
const updateFlashcardsPerSession = useDebounceFn(async () => await setSetting("flashcard_per_session", flashcardsPerSession.value), 1000);

const reviewsPerDayGoal = ref(authStore.getSetting<number>("reviews_per_day_goal"));
const updateReviewsPerDayGoal = useDebounceFn(async () => await setSetting("reviews_per_day_goal", reviewsPerDayGoal.value), 1000);

const showSessionIntroduction = ref(authStore.getSetting<boolean>("show_session_introduction"));
const updateShowSessionIntroduction = async () => await setSetting("show_session_introduction", showSessionIntroduction.value);

const eraseReviews = async () =>
{
    modal.open(ModalConfirm, {
        description: "Are you sure ? This action can not be undone",
        icon: "i-tabler-alert-triangle",
        color: "red",
        async onConfirm()
        {
            await repository.flashcard.resetAll();
            flashcardStore.resetAll();

            useStandardToast("success", {
                description: "All flashcards have been reset"
            });
        }
    });
};
</script>
