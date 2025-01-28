import type { SettingName } from "./settings";

export type Role = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_PREMIUM";

export type User = {
    id: number;
    email: string;
    username: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    roles: Role[];
    settings: Record<SettingName, string | number | boolean>;
    premiumAt: string | null;
};

export type Topic = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    favorite: boolean;
};

export type Unit = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    favorite: boolean;
    topic: Topic;
};

export type State = 0 | 1;
export const StateType: Record<string, State> = {
    new: 0,
    learning: 1
};

export type Flashcard = {
    id: number;
    createdAt: string;
    updatedAt: string;
    front: string;
    back: string;
    details: string;
    nextReview: string;
    previousReview: string;
    state: State;
    difficulty: number | null;
    stability: number | null;
    unit: Unit;
    favorite: boolean;
    help: string | null;
};

export type Auth = {
    username: string;
    email: string;
    identifier: string;
    rawPassword: string;
};

export type ResetPassword = {
    identifier: string;
    token: string;
    password: string;
};

export type Session = {
    id: number;
    startedAt: string;
    endedAt: string;
    totalReviews: number | null;
};

export type Grade = 1 | 2 | 3 | 4;
export const GradeType: Record<string, Grade> = {
    again: 1,
    hard: 2,
    good: 3,
    easy: 4
};

export type Review = {
    id: number;
    date: string;
    grade: Grade;
    reset: boolean;
    flashcard: Flashcard;
};
