<template>
    <BaseModal
        title="Move element to another collection"
        icon="i-tabler-arrow-forward-up-double"
    >
        <UForm
            :schema="schema"
            :state="formData"
            class="flex flex-col gap-y-6"
            :validate-on="['submit']"
            @submit="onSubmit"
        >
            <UFormGroup
                required
                name="collectionId"
                label="Collection"
            >
                <template #hint>
                    <Tooltip
                        activation="hover"
                        help
                        text="Only the first 1000 items are listed"
                    >
                        <UIcon name="i-tabler-info-circle" />
                    </Tooltip>
                </template>
                <USelectMenu
                    v-model="formData.collectionId"
                    v-model:query="formProvider.searchCollectionQuery"
                    :options="formProvider.collections"
                    :search-attributes="['name']"
                    searchable
                    clear-search-on-close
                    placeholder="Select a collection"
                    option-attribute="name"
                    value-attribute="id"
                    searchable-placeholder="Collection name"
                    :loading="formProvider.loadingCollections"
                />
            </UFormGroup>

            <UButton
                type="submit"
                block
                :loading="formProvider.loadingForm"
            >
                Move
            </UButton>
        </UForm>
    </BaseModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FlashcardResponse, TopicResponse, UnitResponse } from "~/types/entity";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
    element: UnitResponse | FlashcardResponse;
    type: "unit" | "flashcard";
}>();

const modal = useModal();
const repository = useRepository();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();

const schema = z.object({
    collectionId: z.number({ required_error: "Select a collection from the list" }),
});

type Schema = z.output<typeof schema>;

const formProvider = reactive({
    collections: [] as (TopicResponse | UnitResponse)[],
    loadingCollections: false,
    loadingForm: false,
    searchCollectionQuery: ""
});

const formData = reactive({
    collectionId: undefined as number | undefined,
});

onMounted(async () =>
{
    await loadCollections();
});

const loadCollections = async () =>
{
    try
    {
        formProvider.loadingCollections = true;

        if (props.type === "unit")
        {
            const response = await repository.topic.findAll(
                { order: "asc", page: 1, sort: "name", itemsPerPage: 1000 },
            );
            formProvider.collections = [...response.data];
        }
        else if (props.type === "flashcard")
        {
            const response = await repository.unit.findAll(
                { order: "asc", page: 1, sort: "name", itemsPerPage: 1000 },
            );
            formProvider.collections = [...response.data];
        }

        const parentId = props.type === "unit"
            ? ((props.element as UnitResponse).topic as TopicResponse).id
            : ((props.element as FlashcardResponse).unit as UnitResponse).id;

        formProvider.collections = formProvider.collections.filter(collection => collection.id !== parentId);
    }
    finally
    {
        formProvider.loadingCollections = false;
    }
};

const onSubmit = async (event: FormSubmitEvent<Schema>) =>
{
    try
    {
        formProvider.loadingForm = true;

        if (props.type === "unit")
        {
            const unit = await repository.unit.partialUpdate(props.element.id, {
                topic: event.data.collectionId,
            });

            unitStore.delete(unit);
        }
        else if (props.type === "flashcard")
        {
            const flashcard = await repository.flashcard.partialUpdate(props.element.id, {
                unit: event.data.collectionId,
            });

            flashcardStore.delete(flashcard);
        }

        useStandardToast("success", {
            description: `${props.type === "flashcard" ? "Flashcard" : "Unit"} ${props.element.id} has been moved to ${props.type === "flashcard" ? "Unit" : "Topic"} ${event.data.collectionId}`
        });

        modal.close();
    }
    finally
    {
        formProvider.loadingForm = false;
    }
};
</script>
