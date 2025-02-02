<template>
    <section class="flex flex-col">
        <div class="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 dark:border-gray-800 overflow-auto">
            <UBreadcrumb :links="breadcrumbItems" />
        </div>
        <div class="py-4 lg:py-6 flex flex-col gap-4">
            <CollectionHeaderAction
                title="Flashcards"
                :count-items="flashcardStore.collectionTotal"
                action-label="Add a flashcard"
                class="px-4 lg:px-6"
                @action-click="showCreateUpdateModal()"
            />
            <UTable
                v-model:sort="pagination.sort"
                :rows="flashcardStore.flashcards"
                :columns="columns"
                :loading="pageProvider.loading"
                sort-mode="manual"
                @update:sort="loadTable"
            >
                <template #previousReview-data="{ row }">
                    <span>{{ row.previousReview ? formatDate(row.previousReview, DateTime.DATE_SHORT) : "-" }}</span>
                </template>
                <template #nextReview-data="{ row }">
                    <UBadge
                        v-if="row.nextReview"
                        :color="urgencyColorFromDate(row.nextReview)"
                        variant="subtle"
                    >
                        {{ formatDate(row.nextReview, DateTime.DATE_SHORT) }}
                    </UBadge>
                    <span v-else>-</span>
                </template>
                <template #createdAt-data="{ row }">
                    <span>{{ formatDate(row.createdAt, DateTime.DATETIME_SHORT) }}</span>
                </template>
                <template #updatedAt-data="{ row }">
                    <span>{{ formatDate(row.updatedAt, DateTime.DATETIME_SHORT) }}</span>
                </template>
                <template #favorite-data="{ row }">
                    <UButton
                        :padded="false"
                        :color="row.favorite ? 'yellow' : 'gray'"
                        variant="link"
                        :icon="row.favorite ? 'i-tabler-star-filled' : 'i-tabler-star'"
                        @click.stop="toggleFavorite(row)"
                    />
                </template>
                <template #actions-data="{ row }">
                    <UDropdown
                        :items="rowOptions(row)"
                        @click.stop
                    >
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="i-tabler-dots"
                        />
                    </UDropdown>
                </template>
            </UTable>
            <div
                v-if="(flashcardStore.collectionTotal / itemsPerPage) > 1"
                class="flex justify-center px-4 lg:px-6"
            >
                <UPagination
                    v-model="pagination.page"
                    :page-count="itemsPerPage"
                    :total="flashcardStore.collectionTotal"
                    @update:model-value="loadTable"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { PaginationOrder } from "~/types/request";
import type { FlashcardResponse, TopicResponse, UnitResponse } from "~/types/entity";
import type { BreadcrumbLink, DropdownItem } from "#ui/types";
import { ModalConfirm, ModalFlashcardForm } from "#components";

// Meta methods for page
definePageMeta({
    name: "flashcards"
});

useHead({
    title: "Flashcards"
});

// Stores and composables
const route = useRoute();
const repository = useRepository();
const topicStore = useTopicStore();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();
const authStore = useAuthStore();
const modal = useModal();

const topicId = parseInt(route.params.topicId as string);
const unitId = parseInt(route.params.unitId as string);

const pageProvider = reactive({
    loading: true
});

const itemsPerPage = authStore.getSetting<number>("items_per_page");
const pagination = reactive({
    page: 1,
    sort: {
        column: "front",
        direction: "asc" as PaginationOrder
    },
});

onBeforeMount(() =>
{
    flashcardStore.flashcards = [];
});

// Lifecycle hooks
onMounted(async () =>
{
    [topicStore.collectionSelectedTopic, unitStore.collectionSelectedUnit] = await Promise.all([
        loadParentCollection<TopicResponse>({ type: "topic", id: topicId }),
        loadParentCollection<UnitResponse>({ type: "unit", id: unitId })
    ]);

    if (topicStore.collectionSelectedTopic && unitStore.collectionSelectedUnit)
    {
        await loadTable();
    }
    else
    {
        useStandardToast("error", {
            description: "Unable to load parent items"
        });
    }
});

// Breadcrumb
const breadcrumbItems = computed<BreadcrumbLink[]>(() => [
    {
        label: "Collection",
        icon: "i-tabler-folder",
        to: {
            name: "topics",
        }
    },
    {
        label: safeValue(topicStore.collectionSelectedTopic?.name, ""),
        to: {
            name: "units",
            params: {
                topicId: topicId
            }
        }
    },
    {
        label: safeValue(unitStore.collectionSelectedUnit?.name, ""),
    }
]);

// Table data
const columns = [{
    key: "front",
    label: "Front",
    sortable: true,
    class: "w-[100%] min-w-[200px]"
}, {
    key: "previousReview",
    label: "Last review",
    sortable: true,
    class: "min-w-[150px]"
}, {
    key: "nextReview",
    label: "Next review",
    sortable: true,
    class: "min-w-[150px]"
}, {
    key: "createdAt",
    label: "Creation",
    sortable: true,
    class: "min-w-[150px]"
}, {
    key: "updatedAt",
    label: "Last update",
    sortable: true,
    class: "min-w-[150px]"
}, {
    key: "favorite",
    label: "Favorite",
    sortable: true,
    class: "w-0"
}, {
    key: "actions",
    label: "Actions",
    class: "w-0"
}];

const loadTable = async () =>
{
    pageProvider.loading = true;

    try
    {
        const response = await repository.flashcard.findByUnit(unitStore.collectionSelectedUnit!.id, {
            order: pagination.sort.direction,
            sort: pagination.sort.column,
            page: pagination.page,
            itemsPerPage
        });

        flashcardStore.flashcards = response.data;
        flashcardStore.collectionTotal = response.pagination.total;
    }
    finally
    {
        pageProvider.loading = false;
    }
};

const toggleFavorite = async (row: FlashcardResponse) =>
{
    const updatedFlashcard = await repository.flashcard.partialUpdate(row.id, {
        favorite: !row.favorite
    });
    flashcardStore.update(row.id, updatedFlashcard);
};

const rowOptions = (row: FlashcardResponse): DropdownItem[][] => [
    [{
        label: "Edit",
        icon: "i-tabler-edit",
        click: () => showCreateUpdateModal(row)
    }, {
        label: "Duplicate",
        icon: "i-tabler-copy",
        click: () => duplicateRow(row)
    }], [{
        label: "Reset",
        icon: "i-tabler-sparkles",
        click: () => resetRow(row)
    }, {
        label: "Delete",
        class: "bg-red-500/15",
        labelClass: "text-red-500",
        iconClass: "bg-red-500",
        icon: "i-tabler-trash",
        click: () => deleteRow(row)
    }]
];

const showCreateUpdateModal = (row?: FlashcardResponse) =>
{
    modal.open(ModalFlashcardForm, {
        topic: topicStore.collectionSelectedTopic!,
        unit: unitStore.collectionSelectedUnit!,
        flashcard: row
    });
};

const duplicateRow = async (row: FlashcardResponse) =>
{
    const response = await repository.flashcard.create({
        front: row.front,
        back: row.back,
        details: row.details,
        help: row.help,
        favorite: false,
        unit: unitStore.collectionSelectedUnit!.id,
    });

    flashcardStore.prepend(response);
    flashcardStore.incrementTotal();
    flashcardStore.incrementCollectionTotal();
    flashcardStore.incrementFlashcardsToReview();

    useStandardToast("success", {
        description: `The flashcard ${row.front} has been duplicated`
    });
};

const resetRow = async (row: FlashcardResponse) =>
{
    modal.open(ModalConfirm, {
        title: "Reset",
        description: `You are about to reset the flashcard ${row.front}. This action can not be undone`,
        icon: "i-tabler-sparkles",
        confirmLabel: "Reset",
        color: "red",
        async onConfirm()
        {
            const flashcard = await repository.flashcard.reset(row.id);
            flashcardStore.update(flashcard.id, flashcard);

            if (row.nextReview && datetimeCompare(DateTime.now().toISO(), row.nextReview) === "after")
            {
                flashcardStore.incrementFlashcardsToReview();
            }

            useStandardToast("success", {
                description: `The flashcard ${row.front} has been reset`
            });
        }
    });
};

const deleteRow = async (row: FlashcardResponse) =>
{
    modal.open(ModalConfirm, {
        title: "Delete",
        description: `You are about to delete the flashcard ${row.front}. This action can not be undone`,
        icon: "i-tabler-trash",
        confirmLabel: "Delete",
        color: "red",
        async onConfirm()
        {
            await repository.flashcard.delete(row.id);

            flashcardStore.delete(row);
            flashcardStore.decrementTotal();
            flashcardStore.decrementCollectionTotal();

            if ((row.nextReview && datetimeCompare(DateTime.now().toISO(), row.nextReview) === "before") || row.nextReview === null)
            {
                flashcardStore.decrementFlashcardsToReview();
            }

            useStandardToast("success", {
                description: `The flashcard ${row.front} has been deleted`
            });
        }
    });
};
</script>
