import type { FlashcardResponse, Grade, SessionResponse } from "./entity";

export type Answer = {
    grade: Grade;
    timestamp: number;
    duration: number; // In milliseconds
};

export type FlashcardSession = {
    session: SessionResponse | null;
    flashcards: FlashcardResponse[];
};

export type Validation = "valid" | "invalid";
