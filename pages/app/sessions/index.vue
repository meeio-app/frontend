<template>
    <section class="py-4 lg:py-6 flex flex-col gap-y-6">
        <div class="px-4 lg:px-6 flex flex-col sm:flex-row justify-end gap-x-3 gap-y-2">
            <UButton
                v-if="showPreviousButton"
                :label="previousButtonLabel"
                variant="ghost"
                color="gray"
                :icon="previousButtonIcon"
                :to="{ name: 'practice' }"
            />
            <UButton
                label="Start a session"
                variant="soft"
                color="primary"
                icon="i-tabler-device-gamepad-2"
                :loading="provider.loadingSession"
                @click="executeStartSession()"
            />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-4 lg:px-6">
            <template v-if="cardData.loading">
                <USkeleton
                    v-for="i in 8"
                    :key="i"
                    class="h-[84px]"
                />
            </template>
            <template v-else>
                <BaseDataCard
                    icon="i-tabler-versions"
                    label="Total sessions"
                    :value="sessionStore.total"
                />
                <BaseDataCard
                    icon="i-tabler-clock-pin"
                    label="Total sessions today"
                    :value="cardData.sessionsOnPeriod"
                />
                <BaseDataCard
                    icon="i-tabler-calendar"
                    label="Total reviews"
                    :value="reviewStore.total"
                />
                <BaseDataCard
                    icon="i-tabler-clock-pin"
                    label="Total reviews today"
                    :value="cardData.reviewsOnPeriod"
                />
                <BaseDataCard
                    icon="i-tabler-calendar-repeat"
                    label="Current streak"
                    :info="cardData.streak.isDanger ? `If you don't practice by the end of the day, your streak will be reset.` : undefined"
                    info-icon="i-tabler-alert-triangle"
                    :value="cardData.streak.current"
                />
                <BaseDataCard
                    icon="i-tabler-calendar-week"
                    label="Longest streak"
                    :value="cardData.streak.longest"
                />
                <BaseDataCard
                    icon="i-tabler-stopwatch"
                    label="Time practicing"
                    :value="formatSecondDurationAbove(cardData.timePracticing)"
                />
                <BaseDataCard
                    icon="i-tabler-target-arrow"
                    label="Goal"
                    :value="`${cardData.reviewsOnPeriod}/${reviewsPerDayGoal} (${formatNumber(cardData.reviewsOnPeriod / (reviewsPerDayGoal > 0 ? reviewsPerDayGoal : 1) * 100)}%)`"
                />
            </template>
        </div>
        <UTable
            v-model:sort="pagination.sort"
            :rows="sessionStore.sessions"
            :columns="columns"
            :loading="provider.loadingTable"
            sort-mode="manual"
            @update:sort="loadTable"
            @select="select"
        >
            <template #startedAt-data="{ row }">
                <span>{{ row.startedAt ? formatDate(row.startedAt, DateTime.DATETIME_MED) : '-' }}</span>
            </template>

            <template #endedAt-data="{ row }">
                <span>{{ row.endedAt ? formatDate(row.endedAt, DateTime.DATETIME_MED) : '-' }}</span>
            </template>
        </UTable>

        <div
            v-if="(sessionStore.total / itemsPerPage) > 1"
            class="flex justify-center"
        >
            <UPagination
                v-model="pagination.page"
                :page-count="itemsPerPage"
                :total="sessionStore.total"
                @update:model-value="loadTable"
            />
        </div>
    </section>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import type { PaginationOrder, Streak } from "~/types/core";
import type { Session } from "~/types/entity";

definePageMeta({
    name: "sessions",
});

useHead({
    title: "Sessions"
});

// Stores and composables
const repository = useRepository();
const sessionStore = useSessionStore();
const reviewStore = useReviewStore();
const practiceStore = usePracticeStore();
const authStore = useAuthStore();

const provider = reactive({
    loadingSession: false,
    loadingTable: false,
});

const cardData = reactive({
    loading: true,
    sessionsOnPeriod: 0,
    reviewsOnPeriod: 0,
    timePracticing: 0,
    streak: {} as Streak
});

const itemsPerPage = authStore.getSetting<number>("items_per_page");
const pagination = reactive({
    page: 1,
    sort: {
        column: "startedAt",
        direction: "desc" as PaginationOrder
    },
});

const reviewsPerDayGoal = authStore.getSetting<number>("reviews_per_day_goal");

// Lifecycle hooks
onMounted(async () =>
{
    await Promise.all([
        loadCards(),
        loadTable()
    ]);
});

const showPreviousButton = computed<boolean>(() => !!practiceStore.session);
const previousButtonLabel = computed<string>(() => practiceStore.hasNextFlashcard ? "Finish last session" : "Previous session results");
const previousButtonIcon = computed<string>(() => practiceStore.hasNextFlashcard ? "i-tabler-arrow-forward-up" : "i-tabler-star");

const executeStartSession = async () =>
{
    try
    {
        provider.loadingSession = true;
        await startSession();
    }
    finally
    {
        provider.loadingSession = false;
    }
};

const loadCards = async () =>
{
    try
    {
        cardData.loading = true;

        [cardData.sessionsOnPeriod, cardData.reviewsOnPeriod, cardData.streak, cardData.timePracticing] = await Promise.all([
            repository.session.count("all", {
                from: DateTime.now().startOf("day").toISO(),
            }),
            repository.review.count("all", {
                from: DateTime.now().startOf("day").toISO(),
            }),
            repository.session.getStreak(),
            repository.session.getTotalTimeInPractice()
        ]);
    }
    finally
    {
        cardData.loading = false;
    }
};

// Table data
const columns = [{
    key: "startedAt",
    label: "Started at",
    sortable: true,
    class: "min-w-[200px]"
}, {
    key: "endedAt",
    label: "Ended at",
    sortable: true,
    class: "min-w-[200px]"
}, {
    key: "totalReviews",
    label: "Total reviews",
    class: "min-w-[200px]"
}];

const loadTable = async () =>
{
    try
    {
        provider.loadingTable = true;

        const response = await repository.session.findAll({
            order: pagination.sort.direction,
            sort: pagination.sort.column,
            page: pagination.page,
            itemsPerPage
        });

        sessionStore.sessions = response.data;
    }
    finally
    {
        provider.loadingTable = false;
    }
};

const select = async (_row: Session) =>
{
    // modal.open(ModalSessionReviewRecap, {
    //     session: row
    // });
};
</script>
