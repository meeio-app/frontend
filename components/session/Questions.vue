<template>
    <div class="flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <UBreadcrumb :links="parentCollection" />
        </div>
        <section class="p-6 grow flex flex-col gap-6 items-center overflow-auto">
            <div class="flex justify-between items-center w-full gap-x-2">
                <SessionLeaveButton :to="{ name: 'sessions' }" />

                <UBadge
                    v-if="practiceStore.currentStrike >= 3"
                    variant="subtle"
                    color="orange"
                    icon="i-tabler-flame"
                >
                    {{ practiceStore.currentStrike }} in a row
                </UBadge>
            </div>

            <UCard
                class="max-w-2xl overflow-auto w-full min-h-[120px]"
                :ui="{ body: { padding: '' }, header: { padding: '' } }"
            >
                <template #header>
                    <div class="flex justify-between items-center gap-x-4 overflow-x-auto p-3 h-14">
                        <SessionFlashcardDifficultyBadge
                            :flashcard="practiceStore.currentFlashcard"
                        />

                        <Tooltip
                            v-if="practiceStore.currentFlashcard.help && !practiceStore.isValidation"
                            class="shrink-0"
                            activation="click"
                            help
                            :text="practiceStore.currentFlashcard.help"
                        >
                            <UButton
                                icon="i-tabler-progress-help"
                                size="xs"
                                square
                                variant="ghost"
                                color="yellow"
                            >
                                Hint
                            </UButton>
                        </Tooltip>
                        <Tooltip
                            v-else-if="practiceStore.currentFlashcard.details && practiceStore.isValidation"
                            class="shrink-0"
                            activation="click"
                            help
                            :text="practiceStore.currentFlashcard.details"
                        >
                            <UButton
                                icon="i-tabler-message-2-plus"
                                size="xs"
                                square
                                variant="ghost"
                                color="primary"
                            >
                                Details
                            </UButton>
                        </Tooltip>
                    </div>
                </template>

                <div class="leading-8 sm:leading-10 md:leading-10 text-base sm:text-lg md:text-xl c-text-primary">
                    <p class="p-4 md:p-5">
                        {{ practiceStore.currentFlashcard.front }}
                    </p>

                    <template v-if="practiceStore.isValidation">
                        <UDivider
                            label="Answer"
                            :ui="{ label: 'c-text-secondary' }"
                        />
                        <p class="p-4 md:p-5">
                            {{ practiceStore.currentFlashcard.back }}
                        </p>
                    </template>
                </div>
            </UCard>

            <div class="grow" />

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full shrink-0">
                <template v-if="!practiceStore.isValidation">
                    <SessionFlashcardAnswerButton
                        v-for="grade in Object.values(GradeType).reverse()"
                        :key="grade"
                        :grade="grade"
                        @answer="answer"
                    />
                </template>
                <template v-else>
                    <UButton
                        class="flex justify-center h-9 sm:h-12 col-span-4 sm:col-span-2"
                        icon="i-tabler-check"
                        variant="outline"
                        color="green"
                        size="lg"
                        :loading="state.loading"
                        @click="sendResponse('valid')"
                    >
                        I'm right
                    </UButton>
                    <UButton
                        class="flex justify-center h-9 sm:h-12 col-span-4 sm:col-span-2"
                        icon="i-tabler-x"
                        variant="outline"
                        color="red"
                        size="lg"
                        :loading="state.loading"
                        @click="sendResponse('invalid')"
                    >
                        Oups, I'm wrong
                    </UButton>
                </template>
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { GradeType, type Grade } from "../../types/entity";
import type { Validation } from "~/types/session";
import Tooltip from "~/components/Tooltip.vue";

const repository = useRepository();
const practiceStore = usePracticeStore();
const reviewStore = useReviewStore();
const flashcardStore = useFlashcardStore();

const state = reactive({
    loading: false,
});

const parentCollection = computed(() => [
    { label: practiceStore.currentFlashcard.unit.topic.name, icon: "i-tabler-folder", labelClass: "text-gray-500 dark:text-gray-400", iconClass: "text-gray-500 dark:text-gray-400" },
    { label: practiceStore.currentFlashcard.unit.name, icon: "i-tabler-color-swatch", labelClass: "text-gray-500 dark:text-gray-400", iconClass: "text-gray-500 dark:text-gray-400" }
]);

const answer = async (gradeType: Grade) =>
{
    practiceStore.currentGrade = gradeType;
};

const sendResponse = async (validationType: Validation) =>
{
    state.loading = true;

    if (validationType === "invalid")
    {
        practiceStore.currentGrade = GradeType.again;
    }

    await repository.flashcard.review(practiceStore.currentFlashcard.id, {
        grade: practiceStore.currentGrade!,
        session: practiceStore.session!.id
    });
    practiceStore.addGrade();
    reviewStore.incrementTotal();
    flashcardStore.decrementFlashcardsToReview();
    state.loading = false;

    if (practiceStore.hasNextFlashcard)
    {
        practiceStore.nextFlashcards();
    }
};
</script>
