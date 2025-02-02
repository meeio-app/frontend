<template>
    <NuxtLayout name="app">
        <template #header>
            Overview
        </template>
        <section class="p-4 lg:p-6 flex flex-col gap-y-4">
            <UCard>
                <div class="flex flex-col gap-y-3">
                    <h2 class="text-xl md:text-2xl c-text-primary">
                        Welcome back {{ safeValue(authStore.user?.username, "") }}
                    </h2>
                    <p class="c-text-secondary text-sm capitalize">
                        {{ DateTime.now().toFormat('DDDD') }}
                    </p>
                    <p class="c-text-secondary text-sm md:text-base">
                        Boost your skills with your flashcards! Each practice session brings you one step closer to your goals. So, are you ready to take on the challenge?
                    </p>

                    <div class="flex flex-col sm:flex-row gap-3">
                        <UButton
                            label="Start a session"
                            icon="i-tabler-device-gamepad-2"
                            :loading="provider.loadingSession"
                            @click="openSessionModal"
                        />
                        <UButton
                            label="Manage collection"
                            variant="ghost"
                            color="gray"
                            :to="{ name: 'topics' }"
                        />
                    </div>
                </div>
            </UCard>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <template v-if="provider.loadingCards">
                    <USkeleton
                        v-for="i in 8"
                        :key="i"
                        class="h-[84px]"
                    />
                </template>
                <template v-else>
                    <BaseDataCard
                        icon="i-tabler-folder"
                        label="Total topics"
                        :value="formatNumber(topicStore.total)"
                    />
                    <BaseDataCard
                        icon="i-tabler-color-swatch"
                        label="Total units"
                        :value="formatNumber(unitStore.total)"
                    />
                    <BaseDataCard
                        icon="i-tabler-cards"
                        label="Total flashcards"
                        :value="formatNumber(flashcardStore.total)"
                    />
                    <BaseDataCard
                        icon="i-tabler-calendar-repeat"
                        label="Flashcards to review"
                        :value="formatNumber(flashcardStore.totalToReview)"
                    />
                    <BaseDataCard
                        icon="i-tabler-versions"
                        label="Total sessions"
                        info="The total number of sessions also takes into account progress resets."
                        :value="formatNumber(sessionStore.total)"
                    />
                    <BaseDataCard
                        icon="i-tabler-calendar"
                        label="Total reviews"
                        info="The total number of reviews also takes into account progress resets."
                        :value="formatNumber(reviewStore.total)"
                    />
                    <BaseDataCard
                        icon="i-tabler-brain"
                        label="Correct flashcards"
                        :value="`${formatNumber(correctFlashcards / (flashcardStore.total > 0 ? flashcardStore.total : 1) * 100)}%`"
                    />
                    <BaseDataCard
                        icon="i-tabler-chart-histogram"
                        label="Average answer"
                        info="The average grade is normalized between 0 and 100. 100 being better than 0."
                        :value="averageGrade !== 0 ? formatNumber(normalizeValue(averageGrade, { min: 1, max: 4 }, { min: 0, max: 100 })) : 0"
                    />
                </template>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <UCard :ui="{ body: { padding: '!p-0' } }">
                    <template #header>
                        Recent topics
                    </template>
                    <UTable
                        :loading="provider.loadingTables"
                        :rows="tableData.recentTopics"
                        :columns="recentItemColumns"
                    />
                </UCard>
                <UCard :ui="{ body: { padding: '!p-0' } }">
                    <template #header>
                        Recent Unit
                    </template>
                    <UTable
                        :loading="provider.loadingTables"
                        :rows="tableData.recentUnits"
                        :columns="recentItemColumns"
                    />
                </UCard>
                <UCard :ui="{ body: { padding: '!p-0' } }">
                    <template #header>
                        Easiest flashcards
                    </template>
                    <UTable
                        :loading="provider.loadingTables"
                        :rows="tableData.easiestFlashcards"
                        :columns="flashcardColumns"
                    />
                </UCard>
                <UCard :ui="{ body: { padding: '!p-0' } }">
                    <template #header>
                        Hardest flashcards
                    </template>
                    <UTable
                        :loading="provider.loadingTables"
                        :rows="tableData.hardestFlashcards"
                        :columns="flashcardColumns"
                    />
                </UCard>
            </div>
        </section>
    </NuxtLayout>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import type { FlashcardResponse, TopicResponse, UnitResponse } from "~/types/entity";

definePageMeta({
    name: "overview",
    middleware: ["auth", "initialize"] // Order is important to first check login and then initialize
});

useHead({
    title: "Overview"
});

const authStore = useAuthStore();
const repository = useRepository();
const topicStore = useTopicStore();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();
const reviewStore = useReviewStore();
const sessionStore = useSessionStore();

const provider = reactive({
    loadingCards: false,
    loadingTables: false,
    loadingSession: false,
});

onMounted(async () =>
{
    await Promise.all([
        loadDashboardCards(),
        loadDashboardTables()
    ]);
});

const correctFlashcards = ref<number>(0);
const averageGrade = ref<number>(0);

const loadDashboardCards = async () =>
{
    try
    {
        provider.loadingCards = true;

        const [totalCorrectFlashcardsRes, averageGradeRes] = await Promise.all([
            repository.flashcard.count("correct"),
            repository.flashcard.averageGrade(),
        ]);

        correctFlashcards.value = totalCorrectFlashcardsRes;
        averageGrade.value = averageGradeRes;

        provider.loadingCards = false;
    }
    catch
    {
        useStandardToast("error");
    }
};

const tableData = reactive({
    recentTopics: [] as TopicResponse[],
    recentUnits: [] as UnitResponse[],
    easiestFlashcards: [] as FlashcardResponse[],
    hardestFlashcards: [] as FlashcardResponse[],
});

const loadDashboardTables = async () =>
{
    try
    {
        provider.loadingTables = true;

        const [recentTopicsRes, recentUnitsRes, easiestFlashcardsRes, hardestFlashcardsRes] = await Promise.all([
            repository.topic.findRecent(),
            repository.unit.findRecents(),
            repository.flashcard.findAll({
                itemsPerPage: 5,
                order: "asc",
                page: 1,
                sort: "difficulty"
            }),
            repository.flashcard.findAll({
                itemsPerPage: 5,
                order: "desc",
                page: 1,
                sort: "difficulty"
            }),
        ]);

        tableData.recentTopics = recentTopicsRes;
        tableData.recentUnits = recentUnitsRes;

        // Keep element that have a difficulty
        tableData.easiestFlashcards = easiestFlashcardsRes.data.filter(f => !!f.difficulty);
        tableData.hardestFlashcards = hardestFlashcardsRes.data.filter(f => !!f.difficulty);

        provider.loadingTables = false;
    }
    catch (err)
    {
        console.error(err);
        useStandardToast("error");
    }
};

const recentItemColumns = [
    {
        key: "name",
        label: "Name",
        class: "w-[30%]",
    }, {
        key: "description",
        label: "Description",
        class: "w-full"
    }
];

const flashcardColumns = [
    {
        key: "front",
        label: "Front",
        class: "w-full"
    },
    {
        key: "difficulty",
        label: "Difficulty",
        class: "w-[0]"
    }
];

const openSessionModal = async () =>
{
    provider.loadingSession = true;
    await startSession();
    provider.loadingSession = false;
};
</script>
