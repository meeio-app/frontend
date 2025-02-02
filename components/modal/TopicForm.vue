<template>
    <BaseModal
        :title="`${props.topic ? 'Update' : 'Create'} a topic`"
        icon="i-tabler-folder"
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
                label="Name"
                name="name"
            >
                <UInput
                    v-model="formData.name"
                    autofocus
                    placeholder="My awesome topic"
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
                v-if="!props.topic"
                v-model="formProvider.keepCreating"
                label="Keep creating topics ?"
            />

            <UButton
                type="submit"
                block
                :loading="formProvider.loading"
            >
                {{ props.topic ? "Update" : "Create" }}
            </UButton>
        </UForm>
    </BaseModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { TopicResponse } from "~/types/entity";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
    topic?: TopicResponse;
}>();

const modal = useModal();
const repository = useRepository();
const topicStore = useTopicStore();
const validationRule = useValidationRule();

const schema = z.object({
    name: validationRule.name,
    description: validationRule.description
});

type Schema = z.output<typeof schema>;

const formProvider = reactive({
    loading: false,
    keepCreating: false
});

const formData = reactive({
    name: safeValue(props.topic?.name, ""),
    description: safeValue(props.topic?.description, ""),
});

const onSubmit = async (event: FormSubmitEvent<Schema>) =>
{
    try
    {
        formProvider.loading = true;

        if (props.topic)
        {
            const topic = await repository.topic.partialUpdate(props.topic.id, {
                name: event.data.name,
                description: event.data.description,
            });

            topicStore.update(props.topic.id, topic);
        }
        else
        {
            const topic = await repository.topic.create({
                name: event.data.name,
                description: event.data.description,
                favorite: false
            });

            topicStore.prepend(topic);
            topicStore.incrementTotal();
        }

        useStandardToast("success", {
            description: `The topic ${event.data.name} has been ${props.topic ? "updated" : "created"}`
        });

        if (formProvider.keepCreating)
        {
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
        formProvider.loading = false;
    }
};
</script>
