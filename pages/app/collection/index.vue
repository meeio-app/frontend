<template>
    <section class="py-4 lg:py-6 flex flex-col gap-4">
        <CollectionHeaderAction
            title="Topics"
            :count-items="topicStore.total"
            action-label="Add a topic"
            class="px-4 lg:px-6"
            @action-click="showCreateUpdateModal()"
        />
        <UTable
            v-model:sort="pagination.sort"
            :rows="topicStore.topics"
            :columns="columns"
            :loading="pageProvider.loading"
            sort-mode="manual"
            @update:sort="loadTable"
            @select="select"
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
            v-if="(topicStore.total / itemsPerPage) > 1"
            class="flex justify-center px-4 lg:px-6"
        >
            <UPagination
                v-model="pagination.page"
                :page-count="itemsPerPage"
                :total="topicStore.total"
                @update:model-value="loadTable"
            />
        </div>
    </section>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import { ModalConfirm, ModalTopicForm } from "#components";
import type { DropdownItem } from "#ui/types";
import type { PaginationOrder } from "~/types/request";
import type { Topic } from "~/types/entity";

definePageMeta({
    name: "topics"
});

const topicStore = useTopicStore();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();
const authStore = useAuthStore();
const repository = useRepository();
const modal = useModal();

const pageProvider = reactive({
    loading: true,
    loadingSession: false,
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
    topicStore.topics = [];
});

// Lifecycle hooks
onMounted(async () =>
{
    topicStore.collectionSelectedTopic = undefined;
    await loadTable();
});

// Table data
const columns = [{
    key: "name",
    label: "Name",
    sortable: true,
    class: "w-[20%] min-w-[200px]"
}, {
    key: "description",
    label: "Description",
    sortable: true,
    class: "w-[56%] min-w-[200px]"
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
    label: "Actions",
    key: "actions",
    class: "w-0"
}];

const loadTable = async () =>
{
    try
    {
        pageProvider.loading = true;

        const response = await repository.topic.findAll({
            order: pagination.sort.direction,
            sort: pagination.sort.column,
            page: pagination.page,
            itemsPerPage
        });

        topicStore.topics = response.data;
    }
    finally
    {
        pageProvider.loading = false;
    }
};

// Table actions
const toggleFavorite = async (row: Topic) =>
{
    const updatedTopic = await repository.topic.partialUpdate(row.id, {
        favorite: !row.favorite
    });
    topicStore.update(row.id, updatedTopic);
};

const rowOptions = (row: Topic): DropdownItem[][] => [
    [
        {
            label: "Start a session",
            icon: "i-tabler-device-gamepad-2",
            class: "bg-primary-300/15 hover:!bg-gray-100 dark:hover:!bg-gray-900",
            labelClass: "text-primary-500",
            iconClass: "bg-primary-500",
            click: () => excuteStartSession(row)
        }
    ], [
        {
            label: "Edit",
            icon: "i-tabler-edit",
            click: () => showCreateUpdateModal(row)
        }, {
            label: "Duplicate",
            icon: "i-tabler-copy",
            click: () => duplicateRow(row)
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

const excuteStartSession = async (row: Topic) =>
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
            type: "topic"
        });
    }
    finally
    {
        pageProvider.loadingSession = false;
    }
};

const showCreateUpdateModal = (row?: Topic) =>
{
    modal.open(ModalTopicForm, {
        topic: row
    });
};

const duplicateRow = async (row: Topic) =>
{
    const response = await repository.topic.create({
        name: row.name,
        description: row.description,
        favorite: false
    });

    topicStore.prepend(response);
    topicStore.incrementTotal();

    useStandardToast("success", {
        description: `The topic ${row.name} has been duplicated`
    });
};

const resetRow = async (row: Topic) =>
{
    modal.open(ModalConfirm, {
        title: "Reset",
        description: `You are about to reset the topic ${row.name}. This action can not be undone`,
        icon: "i-tabler-sparkles",
        confirmLabel: "Reset",
        color: "red",
        async onConfirm()
        {
            await repository.topic.reset(row.id);
            flashcardStore.totalToReview = await repository.flashcard.count("to-review");

            useStandardToast("success", {
                description: `The topic ${row.name} has been reset`
            });
        }
    });
};

const deleteRow = async (row: Topic) =>
{
    modal.open(ModalConfirm, {
        title: "Delete",
        description: `You are about to delete the topic ${row.name}. This action can not be undone`,
        icon: "i-tabler-trash",
        confirmLabel: "Delete",
        color: "red",
        async onConfirm()
        {
            await repository.topic.delete(row.id);
            topicStore.delete(row);
            topicStore.decrementTotal();

            [unitStore.total, flashcardStore.totalToReview, flashcardStore.total] = await Promise.all([
                repository.unit.count("all"),
                repository.flashcard.count("to-review"),
                repository.flashcard.count("all")
            ]);

            useStandardToast("success", {
                description: `The topic ${row.name} has been deleted`
            });
        }
    });
};

const select = (row: Topic) =>
{
    topicStore.collectionSelectedTopic = row;
    return navigateTo({
        name: "units",
        params: {
            topicId: row.id
        }
    });
};
</script>
