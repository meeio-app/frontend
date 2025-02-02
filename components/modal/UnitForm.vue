<template>
    <BaseModal
        :title="`${props.topic ? 'Update' : 'Create'} a unit`"
        icon="i-tabler-color-swatch"
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
                />
            </UFormGroup>

            <UFormGroup
                required
                label="Name"
                name="name"
            >
                <UInput
                    v-model="formData.name"
                    autofocus
                    placeholder="My awesome unit"
                />
            </UFormGroup>

            <UFormGroup
                label="Description"
                name="description"
            >
                <UTextarea
                    v-model="formData.description"
                    :rows="7"
                    placeholder="This topic contains wonderful items"
                />
            </UFormGroup>

            <UCheckbox
                v-if="!props.unit"
                v-model="formProvider.keepCreating"
                label="Keep creating units ?"
            />

            <UButton
                type="submit"
                block
                :loading="formProvider.loadingForm"
            >
                {{ props.unit ? "Update" : "Create" }}
            </UButton>
        </UForm>
    </BaseModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { TopicResponse, UnitResponse } from "~/types/entity";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
    topic?: TopicResponse;
    unit?: UnitResponse;
}>();

const modal = useModal();
const repository = useRepository();
const topicStore = useTopicStore();
const unitStore = useUnitStore();
const validationRule = useValidationRule();

const schema = z.object({
    topicId: z.number({ required_error: "Select a topic from the list" }),
    name: validationRule.name,
    description: validationRule.description,
});

type Schema = z.output<typeof schema>;

const formProvider = reactive({
    topics: [] as TopicResponse[],
    loadingTopics: false,
    loadingForm: false,
    keepCreating: false,
    searchTopicQuery: props.topic ? props.topic.name : ""
});

const formData = reactive({
    topicId: props.topic?.id,
    name: safeValue(props.unit?.name, ""),
    description: safeValue(props.unit?.description, ""),
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

const onSubmit = async (event: FormSubmitEvent<Schema>) =>
{
    try
    {
        formProvider.loadingForm = true;

        if (props.unit)
        {
            const unit = await repository.unit.partialUpdate(props.unit.id, {
                name: event.data.name,
                description: event.data.description,
            });

            unitStore.update(props.unit.id, unit);
        }
        else
        {
            const unit = await repository.unit.create(event.data.topicId, {
                name: event.data.name,
                description: event.data.description,
                favorite: false
            });

            if (topicStore.collectionSelectedTopic && topicStore.collectionSelectedTopic.id === event.data.topicId)
            {
                unitStore.prepend(unit);
                unitStore.incrementCollectionTotal();
            }

            unitStore.incrementTotal();
        }

        useStandardToast("success", {
            description: `The unit ${event.data.name} has been ${props.unit ? "updated" : "created"}`
        });

        if (formProvider.keepCreating)
        {
            if (!props.topic)
            {
                formData.topicId = undefined;
                formProvider.searchTopicQuery = "";
            }
            formData.name = "";
            formData.description = "";
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
