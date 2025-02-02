import type { FlashcardResponse } from "~/types/entity";

type State = {
    flashcards: FlashcardResponse[];
    total: number;
    totalToReview: number;
    collectionTotal: number;
};

export const useFlashcardStore = defineStore("flashcard", {
    state: (): State => ({
        flashcards: [],
        total: 0,
        totalToReview: 0,
        collectionTotal: 0
    }),
    actions: {
        resetAll()
        {
            this.totalToReview = this.total;
        },
        prepend(item: FlashcardResponse)
        {
            this.flashcards = [item, ...this.flashcards];
        },
        append(item: FlashcardResponse)
        {
            this.flashcards = [...this.flashcards, item];
        },
        delete(item: FlashcardResponse)
        {
            const itemToRemove = this.flashcards.findIndex(f => f.id === item.id);
            this.flashcards.splice(itemToRemove, 1);
        },
        update(id: number, item: Partial<FlashcardResponse>)
        {
            const itemToUpdate = this.flashcards.findIndex(f => f.id === id);
            if (itemToUpdate !== -1)
            {
                const previousItem = this.flashcards[itemToUpdate];
                this.flashcards[itemToUpdate] = {
                    ...previousItem,
                    ...item
                };
            }
        },
        incrementTotal()
        {
            this.total++;
        },
        decrementTotal()
        {
            this.total--;
        },
        incrementFlashcardsToReview()
        {
            this.totalToReview++;
        },
        decrementFlashcardsToReview()
        {
            this.totalToReview--;
        },
        incrementCollectionTotal()
        {
            this.collectionTotal++;
        },
        decrementCollectionTotal()
        {
            this.collectionTotal--;
        }
    },
    getters: {}
});
