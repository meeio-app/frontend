import { DateTime } from "luxon";
import { defineStore } from "pinia";
import { GradeType, type FlashcardResponse, type Grade, type Session } from "~/types/entity";
import type { Answer, FlashcardSession } from "~/types/session";

type State = {
    session?: Session;
    flashcards: FlashcardResponse[];
    currentFlashcardIndex: number;
    currentGrade?: Grade;
    grades: Answer[];
};

export const usePracticeStore = defineStore("practice", {
    persist: true,
    state: (): State => ({
        session: undefined,
        flashcards: [],
        currentFlashcardIndex: 0,
        currentGrade: undefined,
        grades: [],
    }),
    actions: {
        defineSession(session: FlashcardSession)
        {
            const sessionStore = useSessionStore();
            sessionStore.incrementTotal();

            this.session = session.session!;
            this.flashcards = session.flashcards;
            this.currentFlashcardIndex = 0;
            this.grades = [];
        },
        addGrade()
        {
            const now = DateTime.now().toMillis();

            this.grades.push({
                grade: this.currentGrade!,
                timestamp: now,
                duration: this.currentFlashcardIndex === 0
                    ? now - DateTime.fromISO(this.session!.startedAt).toMillis()
                    : now - this.grades[this.currentFlashcardIndex - 1].timestamp
            });

            this.currentGrade = undefined;
        },
        nextFlashcards()
        {
            this.currentFlashcardIndex++;
        },
        previousFlashcard()
        {
            this.currentFlashcardIndex--;
        },
    },
    getters: {
        isValidation(state)
        {
            return state.currentGrade !== undefined;
        },
        currentFlashcard(state)
        {
            return state.flashcards[state.currentFlashcardIndex];
        },
        hasNextFlashcard(state)
        {
            return state.currentFlashcardIndex < state.flashcards.length;
        },
        accuracy(state)
        {
            const total = state.grades
                .map(g => g.grade - 1) // Only keep the grades from 0 to 3 instead of 1 to 4
                .reduce((acc, g) => acc + g, 0);

            // Calculate the accuracy between 0 and 1
            return total / (state.grades.length * (GradeType.easy - 1));
        },
        currentStrike(state)
        {
            const grades = state.grades.map(g => g.grade).reverse();

            let strike = 0;

            for (const grade of grades)
            {
                if (IsGradeCorrect(grade))
                {
                    strike++;
                }
                else
                {
                    break;
                }
            }

            return strike;
        },
        mostFrequentGrade(state)
        {
            return state.grades
                .map(g => g.grade)
                .sort((a, b) =>
                    state.grades.filter(v => v.grade === a).length - state.grades.filter(v => v.grade === b).length
                )
                .pop();
        },
    }
});
