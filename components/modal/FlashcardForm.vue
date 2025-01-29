<template>
    <BaseModal
        :title="`${props.topic ? 'Update' : 'Create'} a flashcard`"
        icon="i-tabler-cards"
    >
        <UForm
            :schema="schema"
            :state="formData"
            class="flex flex-col gap-y-6"
            :validate-on="['submit']"
            @submit="onSubmit"
        >
            <UFormGroup
                v-if="props.topic === undefined"
                required
                name="topicId"
                label="Topic"
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
                    v-model="formData.topicId"
                    v-model:query="formProvider.searchTopicQuery"
                    :options="formProvider.topics"
                    :search-attributes="['name']"
                    searchable
                    clear-search-on-close
                    placeholder="Select a topic"
                    option-attribute="name"
                    value-attribute="id"
                    searchable-placeholder="Topic name"
                    :loading="formProvider.loadingTopics"
                    @change="loadUnits"
                />
            </UFormGroup>
            <UFormGroup
                v-if="props.unit === undefined"
                required
                name="unitId"
                label="Unit"
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
                    v-model="formData.unitId"
                    v-model:query="formProvider.searchUnitQuery"
                    :options="formProvider.units"
                    :search-attributes="['name']"
                    searchable
                    clear-search-on-close
                    placeholder="Select a unit"
                    option-attribute="name"
                    value-attribute="id"
                    searchable-placeholder="Unit name"
                    :loading="formProvider.loadingUnits"
                    :disabled="formData.topicId === undefined"
                />
            </UFormGroup>
            <UFormGroup
                required
                label="Front side"
                name="front"
            >
                <UInput
                    v-model="formData.front"
                    autofocus
                    placeholder="Front side of the card"
                />
            </UFormGroup>

            <UFormGroup
                required
                label="Back side"
                name="back"
            >
                <UInput
                    v-model="formData.back"
                    placeholder="Back side of the card"
                />
            </UFormGroup>

            <UFormGroup
                label="Help"
                name="help"
            >
                <UInput
                    v-model="formData.help"
                    placeholder="Any kind of hint"
                />
            </UFormGroup>

            <UFormGroup
                label="Details"
                name="details"
            >
                <UTextarea
                    v-model="formData.details"
                    :rows="7"
                    placeholder="Some details and explanations..."
                />
            </UFormGroup>

            <UCheckbox
                v-if="!props.flashcard"
                v-model="formProvider.keepCreating"
                label="Keep creating flashcards ?"
            />

            <UButton
                type="submit"
                block
                :loading="formProvider.loadingForm"
            >
                {{ props.flashcard ? "Update" : "Create" }}
            </UButton>
        </UForm>
    </BaseModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Topic, Unit, Flashcard } from "~/types/entity";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
    topic?: Topic;
    unit?: Unit;
    flashcard?: Flashcard;
}>();

const modal = useModal();
const repository = useRepository();
const unitStore = useUnitStore();
const flashcardStore = useFlashcardStore();
const validationRule = useValidationRule();

const schema = z.object({
    topicId: z.number({ required_error: "Select a topic from the list" }),
    unitId: z.number({ required_error: "Select a unit from the list" }),
    front: validationRule.front,
    back: validationRule.back,
    details: validationRule.details,
    help: validationRule.help,
});

type Schema = z.output<typeof schema>;

const formProvider = reactive({
    topics: [] as Topic[],
    loadingTopics: false,
    searchTopicQuery: safeValue(props.topic?.name, ""),
    units: [] as Unit[],
    loadingUnits: false,
    searchUnitQuery: safeValue(props.unit?.name, ""),
    loadingForm: false,
    keepCreating: false
});

const formData = reactive({
    topicId: props.topic?.id,
    unitId: props.unit?.id,
    front: safeValue(props.flashcard?.front, ""),
    back: safeValue(props.flashcard?.back, ""),
    help: safeValue(props.flashcard?.help, ""),
    details: safeValue(props.flashcard?.details, ""),
});

onMounted(async () =>
{
    if (!props.topic)
    {
        await loadTopics();
    }
});

const loadTopics = async () =>
{
    try
    {
        formProvider.loadingTopics = true;

        const response = await repository.topic.findAll(
            { order: "asc", page: 1, sort: "name", itemsPerPage: 1000 },
        );
        formProvider.topics = [...response.data];
    }
    finally
    {
        formProvider.loadingTopics = false;
    }
};

const loadUnits = async () =>
{
    formData.unitId = undefined;

    if (!formData.topicId)
    {
        formProvider.units = [];
        return;
    }

    try
    {
        formProvider.loadingUnits = true;

        const response = await repository.unit.findByTopic(
            formData.topicId,
            { order: "asc", page: 1, sort: "name", itemsPerPage: 1000 },
        );
        formProvider.units = [...response.data];
    }
    finally
    {
        formProvider.loadingUnits = false;
    }
};

const onSubmit = async (event: FormSubmitEvent<Schema>) =>
{
    try
    {
        formProvider.loadingForm = true;

        if (props.flashcard)
        {
            const flashcard = await repository.flashcard.partialUpdate(props.flashcard.id, {
                front: event.data.front,
                back: event.data.back,
                details: event.data.details ?? null,
                help: event.data.help ?? null
            });

            flashcardStore.update(props.flashcard.id, flashcard);
        }
        else
        {
            const flashcard = await repository.flashcard.create(event.data.unitId, {
                front: event.data.front,
                back: event.data.back,
                details: event.data.details,
                help: event.data.help,
                favorite: false
            });

            flashcardStore.incrementFlashcardsToReview();

            if (unitStore.collectionSelectedUnit && unitStore.collectionSelectedUnit.id === event.data.unitId)
            {
                flashcardStore.prepend(flashcard);
                flashcardStore.incrementCollectionTotal();
            }
            
            flashcardStore.incrementTotal();
        }

        useStandardToast("success", {
            description: `The flashcard ${event.data.front} has been ${props.flashcard ? "updated" : "created"}`
        });

        if (formProvider.keepCreating)
        {
            if (!props.topic)
            {
                formData.topicId = undefined;
                formProvider.searchTopicQuery = "";
            }

            if (!props.unit)
            {
                formData.unitId = undefined;
                formProvider.searchUnitQuery = "";
            }

            formData.front = "";
            formData.back = "";
            formData.help = "";
            formData.details = "";
        }
        else
        {
            modal.close();
        }
    }
    finally
    {
        formProvider.loadingForm = false;
    }
};
</script>
