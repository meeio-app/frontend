<template>
    <div class="h-full flex flex-col">
        <UMeter
            :value="practiceStore.currentFlashcardIndex"
            :max="practiceStore.flashcards.length"
            size="sm"
        />
        <SessionQuestions
            v-if="practiceStore.hasNextFlashcard && practiceStore.session"
            class="grow"
        />
        <SessionResults
            v-else
            class="grow"
        />
    </div>
</template>

<script lang="ts" setup>
import { ModalConfirm } from "#components";

definePageMeta({
    name: "practice",
});

const modal = useModal();
const practiceStore = usePracticeStore();

onBeforeRouteLeave(async () =>
{
    return practiceStore.hasNextFlashcard && practiceStore.session ? await displayModalAsync() : true;
});

const displayModalAsync = () =>
{
    return new Promise<boolean>((resolve) =>
    {
        modal.open(ModalConfirm, {
            title: "Leave the session",
            description: "Are you sure you want to leave this session ?",
            icon: "i-tabler-door-exit",
            cancelLabel: "Stay here",
            confirmLabel: "Leave",
            color: "red",
            onConfirm: () => resolve(true),
            onClose: () => resolve(false)
        });
    });
};
</script>
