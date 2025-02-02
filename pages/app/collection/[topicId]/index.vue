<template>
    <section class="flex flex-col">
        <div class="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 dark:border-gray-800 overflow-auto">
            <UBreadcrumb :links="breadcrumbItems" />
        </div>
        <div class="py-4 lg:py-6 flex flex-col gap-4">
            <CollectionHeaderAction
                title="Units"
                :count-items="unitStore.collectionTotal"
                action-label="Add a unit"
                class="px-4 lg:px-6"
                @action-click="showCreateUpdateModal()"
            />
            <UTable
                v-model:sort="pagination.sort"
                :rows="unitStore.units"
                :columns="columns"
                :loading="pageProvider.loading"
                sort-mode="manual"
                @update:sort="loadTable"
                @select="selectRow"
            >
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
                v-if="(unitStore.collectionTotal / itemsPerPage) > 1"
                class="flex justify-center px-4 lg:px-6"
            >
                <UPagination
                    v-model="pagination.page"
                    :page-count="itemsPerPage"
                    :total="unitStore.collectionTotal"
                    @update:model-value="loadTable"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { ModalConfirm, ModalMoveToCollection, ModalUnitForm } from "#components";
import type { BreadcrumbLink, DropdownItem } from "#ui/types";
import type { PaginationOrder } from "~/types/request";
import type { TopicResponse, UnitResponse } from "~/types/entity";

definePageMeta({
    name: "units"
});

useHead({
    title: "Units"
});

const route = useRoute();
const repository = useRepository();
const topicStore = useTopicStore();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();
const authStore = useAuthStore();
const modal = useModal();

const topicId = parseInt(route.params.topicId as string);

const pageProvider = reactive({
    loading: true,
    loadingSession: false
});

const itemsPerPage = authStore.getSetting<number>("items_per_page");
const pagination = reactive({
    page: 1,
    sort: {
        column: "name",
        direction: "asc" as PaginationOrder
    },
});

onBeforeMount(() =>
{
    unitStore.units = [];
});

// Lifecycle hooks
onMounted(async () =>
{
    unitStore.collectionSelectedUnit = undefined;
    topicStore.collectionSelectedTopic = await loadParentCollection<TopicResponse>({ type: "topic", id: topicId });

    if (topicStore.collectionSelectedTopic)
    {
        await loadTable();
    }
    else
    {
        useStandardToast("error", {
            description: "Unable to load parent topic"
        });
    }
});

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
    }
]);

// Table data
const columns = [{
    key: "name",
    label: "Name",
    sortable: true,
    class: "w-[30%] min-w-[200px]"
}, {
    key: "description",
    label: "Description",
    sortable: true,
    class: "w-[100%] min-w-[200px]"
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
    try
    {
        pageProvider.loading = true;

        const repsonse = await repository.unit.findByTopic(topicStore.collectionSelectedTopic!.id, {
            order: pagination.sort.direction,
            sort: pagination.sort.column,
            page: pagination.page,
            itemsPerPage
        });

        unitStore.units = repsonse.data;
        unitStore.collectionTotal = repsonse.pagination.total;
    }
    finally
    {
        pageProvider.loading = false;
    }
};

const toggleFavorite = async (row: UnitResponse) =>
{
    const updatedUnit = await repository.unit.partialUpdate(row.id, {
        favorite: !row.favorite
    });
    unitStore.update(row.id, updatedUnit);
};

const rowOptions = (row: UnitResponse): DropdownItem[][] => [
    [
        {
            label: "Start a session",
            icon: "i-tabler-device-gamepad-2",
            class: "bg-primary-300/15 hover:!bg-gray-100 dark:hover:!bg-gray-900",
            labelClass: "text-primary-500",
            iconClass: "bg-primary-500",
            click: () => excuteStartSession(row)
        }
    ],
    [
        {
            label: "Edit",
            icon: "i-tabler-edit",
            click: () => showCreateUpdateModal(row)
        }, {
            label: "Duplicate",
            icon: "i-tabler-copy",
            click: () => duplicateRow(row)
        }, {
            label: "Move",
            icon: "i-tabler-arrow-forward-up-double",
            click: () => moveRow(row)
        }
    ], [
        {
            label: "Reset",
            icon: "i-tabler-sparkles",
            click: () => resetRow(row)
        }, {
            label: "Delete",
            class: "bg-red-500/15 hover:!bg-gray-100 dark:hover:!bg-gray-900",
            labelClass: "text-red-500",
            iconClass: "bg-red-500",
            icon: "i-tabler-trash",
            click: () => deleteRow(row)
        }
    ]
];

const excuteStartSession = async (row: UnitResponse) =>
{
    if (pageProvider.loadingSession)
    {
        return;
    }

    try
    {
        pageProvider.loadingSession = true;
        await startSession({
            id: row.id,
            type: "unit"
        });
    }
    finally
    {
        pageProvider.loadingSession = false;
    }
};

const showCreateUpdateModal = (row?: UnitResponse) =>
{
    modal.open(ModalUnitForm, {
        topic: topicStore.collectionSelectedTopic!,
        unit: row
    });
};

const duplicateRow = async (row: UnitResponse) =>
{
    const response = await repository.unit.create(topicStore.collectionSelectedTopic!.id, {
        name: row.name,
        description: row.description,
        favorite: false
    });

    unitStore.prepend(response);
    unitStore.incrementTotal();
    unitStore.incrementCollectionTotal();

    useStandardToast("success", {
        description: `The unit ${row.name} has been duplicated`
    });
};

const moveRow = (row: UnitResponse) =>
{
    modal.open(ModalMoveToCollection, {
        element: row,
        type: "unit",
    });
};

const resetRow = async (row: UnitResponse) =>
{
    modal.open(ModalConfirm, {
        title: "Reset",
        description: `You are about to reset the unit ${row.name}. This action can not be undone`,
        icon: "i-tabler-sparkles",
        confirmLabel: "Reset",
        color: "red",
        async onConfirm()
        {
            await repository.unit.reset(row.id);
            flashcardStore.totalToReview = await repository.flashcard.count("to-review");

            useStandardToast("success", {
                description: `The unit ${row.name} has been reset`
            });
        }
    });
};

const deleteRow = async (row: UnitResponse) =>
{
    modal.open(ModalConfirm, {
        title: "Delete",
        description: `You are about to delete the unit ${row.name}. This action can not be undone`,
        icon: "i-tabler-trash",
        confirmLabel: "Delete",
        color: "red",
        async onConfirm()
        {
            await repository.unit.delete(row.id);

            [flashcardStore.totalToReview, flashcardStore.total] = await Promise.all([
                repository.flashcard.count("to-review"),
                repository.flashcard.count("all")
            ]);

            unitStore.delete(row);
            unitStore.decrementTotal();
            unitStore.decrementCollectionTotal();

            useStandardToast("success", {
                description: `The unit ${row.name} has been deleted`
            });
        }
    });
};

const selectRow = (row: UnitResponse) =>
{
    unitStore.collectionSelectedUnit = row;
    return navigateTo({
        name: "flashcards",
        params: {
            topicId: topicStore.collectionSelectedTopic!.id,
            unitId: row.id
        }
    });
};
</script>
