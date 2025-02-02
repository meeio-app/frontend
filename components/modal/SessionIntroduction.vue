<template>
    <BaseModal title="Challenge Your Knowledge">
        <div class="flex flex-col space-y-6 c-text-primary">
            <p>Welcome to your session where you take on your entire brain! You'll be pulling cards from your own collection, so <b>no topic is safe</b>. Math? Korean? Cooking? That random science fact you swore you'd never forget? They're all in the mix, because you made them!</p>

            <p>
                Each card has a question you've crafted, and your mission, should you choose to accept, is to answer without sneaking a look at the back. After each question, you'll rate your performance :
                <span class="space-x-1">
                    <DifficultyBadge
                        color="green"
                        icon="i-tabler-checks"
                        label="Easy"
                        tooltip-text="Nailed it! You could answer this one in your sleep!"
                    />
                    <DifficultyBadge
                        color="sky"
                        icon="i-tabler-circle-dashed-check"
                        label="Good"
                        tooltip-text="Nicely done! You've got the gist, but maybe a bit more practice wouldn't hurt."
                    />
                    <DifficultyBadge
                        color="orange"
                        icon="i-tabler-brain"
                        label="Hard"
                        tooltip-text="Close, but not quite there. It's a tough one, but you're getting it!"
                    />
                    <DifficultyBadge
                        color="red"
                        icon="i-tabler-reload"
                        label="Again"
                        tooltip-text="Oops! Let's give that one another go—your brain's still warming up!"
                    />
                </span>
            </p>

            <p>Get it right, and bask in the glory. Get it wrong, and well… it's still your collection, so nobody else has to know!</p>

            <p>Time to outwit your own memory!</p>

            <p>
                <span v-if="lowRange !== highRange">This session will last between <b>{{ lowRange }}-{{ highRange }} minutes</b>.</span>
                <span v-else>This session will last approximately <b>{{ lowRange }} minutes</b>.</span>
            </p>

            <UCheckbox
                v-model="dontShowAgain"
                label="Don't show again?"
            />

            <UButton
                block
                icon="i-tabler-device-gamepad-2"
                :loading="provider.loading"
                @click="playButtonClick"
            >
                Let's play
            </UButton>
        </div>
    </BaseModal>
</template>

<script setup lang="ts">
import type { Collection } from "~/types/utils";

const props = defineProps<{
    collection?: Collection;
}>();

const modal = useModal();
const authStore = useAuthStore();

const dontShowAgain = ref(false);

const provider = reactive({
    loading: false
});

const flashcardsPerSession = authStore.getSetting<number>("flashcard_per_session");
const lowRange = secondsToMinutes(flashcardsPerSession * 5); // 5s per flashcard
const highRange = secondsToMinutes(flashcardsPerSession * 30); // 20s per flashcard

const playButtonClick = async () =>
{
    try
    {
        provider.loading = true;
        if (dontShowAgain.value)
        {
            await setSetting("show_session_introduction", !dontShowAgain.value);
        }

        await startSession(props.collection, false);
        await modal.close();
    }
    finally
    {
        provider.loading = false;
    }
};
</script>
