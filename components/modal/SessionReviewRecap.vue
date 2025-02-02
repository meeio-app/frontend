<template>
    <BaseModal
        title="Session recap"
        borderless
        fullscreen
    >
        <UTable
            :columns="columns"
            :loading="provider.loading"
            :rows="reviews"
        >
            <template #date-data="{ row }">
                <span>{{ formatDate(row.date, DateTime.DATETIME_MED_WITH_SECONDS) }}</span>
            </template>

            <template #grade-data="{ row }">
                <UBadge
                    :color="gradeData(row.grade).color as BadgeColor"
                    variant="subtle"
                >
                    <span v-if="row.grade === GradeType.easy">Easy</span>
                    <span v-if="row.grade === GradeType.good">Good</span>
                    <span v-if="row.grade === GradeType.hard">Hard</span>
                    <span v-if="row.grade === GradeType.again">Again</span>
                </UBadge>
            </template>
        </UTable>
    </BaseModal>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { GradeType, type ReviewResponse, type SessionResponse } from "~/types/entity";
import type { BadgeColor } from "#ui/types";

const props = defineProps<{
    session: SessionResponse;
}>();

const repository = useRepository();

const columns = [
    {
        key: "flashcard.front",
        label: "Question",
        class: "w-[60%] min-w-[200px]"
    },
    {
        key: "flashcard.unit.name",
        label: "Unit",
        class: "w-[20%] min-w-[200px]"
    },
    {
        key: "flashcard.unit.topic.name",
        label: "Topic",
        class: "w-[20%] min-w-[200px]"
    },
    {
        key: "grade",
        label: "Grade",
        class: "min-w-[100px]"
    },
    {
        key: "date",
        label: "Date",
        class: "min-w-[200px]"
    },
];

const reviews = ref<ReviewResponse[]>([]);

const provider = reactive({
    loading: false
});

onMounted(async () =>
{
    await loadTable();
});

const loadTable = async () =>
{
    provider.loading = true;
    const reviewsResponse = await repository.review.findAllBySession(props.session.id);
    reviews.value = reviewsResponse.data;
    provider.loading = false;
};
</script>
