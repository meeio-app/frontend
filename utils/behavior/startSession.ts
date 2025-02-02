import { ModalSessionIntroduction } from "#components";
import { usePracticeStore } from "~/stores/practice.store";
import type { Collection } from "~/types/utils";

export default async (collection?: Collection, enableIntroductionModal: boolean = true) =>
{
    const modal = useModal();
    const authStore = useAuthStore();

    if (enableIntroductionModal && authStore.getSetting("show_session_introduction"))
    {
        modal.open(ModalSessionIntroduction, {
            collection
        });
        return;
    }

    const session = await getSession(collection);

    if (session.session === null)
    {
        useStandardToast("warning", {
            description: collection ? "You have no flashcards to review today on this collection" : "You have no flashcards to review today"
        });
        return;
    }

    usePracticeStore().defineSession(session);

    await navigateTo({
        name: "practice"
    });
};
