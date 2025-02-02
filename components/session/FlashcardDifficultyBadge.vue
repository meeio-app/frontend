<template>
    <Tooltip
        class="shrink-0"
        activation="hover"
        :disabled="props.flashcard.difficulty === null"
        :text="`Difficulty of ${formatNumber(props.flashcard.difficulty ?? 0)}/10`"
        :help="props.flashcard.difficulty !== null"
    >
        <UBadge
            :color="difficulty.color"
            variant="subtle"
        >
            {{ difficulty.label }}
        </UBadge>
    </Tooltip>
</template>

<script lang="ts" setup>
import type { FlashcardResponse } from "~/types/entity";
import type { BadgeColor } from "#ui/types";

const props = defineProps<{
    flashcard: FlashcardResponse;
}>();

const difficulty = computed<{ label: string; color: BadgeColor }>(() =>
{
    if (!props.flashcard || props.flashcard.difficulty === null)
    {
        return {
            label: "Not trained yet",
            color: "gray"
        };
    }

    if (props.flashcard.difficulty >= 7)
    {
        return {
            label: "Hard",
            color: "red"
        };
    }
    else if (props.flashcard.difficulty <= 4)
    {
        return {
            label: "Easy",
            color: "green"
        };
    }
    else
    {
        return {
            label: "Medium",
            color: "yellow"
        };
    }
});
</script>
