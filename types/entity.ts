import type { SettingName } from "./settings";

export type Role = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_PREMIUM";

// User
type BaseUser = {
    email: string;
    username: string;
};

export type UserResponse = BaseUser & {
    id: number;
    token: string;
    createdAt: string;
    updatedAt: string;
    roles: Role[];
    settings: Record<SettingName, string | number | boolean>;
    premiumAt: string | null;
};

export type UserRequest = BaseUser & {
    rawPassword: string;
};

// Topic
type BaseTopic = {
    name: string;
    description: string;
    favorite: boolean;
};

export type TopicResponse = BaseTopic & {
    id: number;
    createdAt: string;
    updatedAt: string;
};

export type TopicRequest = BaseTopic & {};

// Unit
type BaseUnit = {
    name: string;
    description: string;
    favorite: boolean;
};

export type UnitResponse = BaseUnit & {
    id: number;
    createdAt: string;
    updatedAt: string;
    topic: TopicResponse;
};

export type UnitRequest = BaseUnit & {
    topic: number;
};

// Flashcard
export type State = 0 | 1;
export const StateType: Record<string, State> = {
    new: 0,
    learning: 1
};

type BaseFlashcard = {
    front: string;
    back: string;
    details: string;
    favorite: boolean;
    help: string | null;
};

export type FlashcardResponse = BaseFlashcard & {
    id: number;
    createdAt: string;
    updatedAt: string;
    nextReview: string;
    previousReview: string;
    state: State;
    difficulty: number | null;
    stability: number | null;
    unit: UnitResponse;
};

export type FlashcardRequest = BaseFlashcard & {
    unit: number;
};

// Auth
export type Auth = {
    username: string;
    email: string;
    identifier: string;
    rawPassword: string;
};

export type ResetPassword = {
    identifier: string;
    token: string;
    rawPassword: string;
};

// Session
export type SessionResponse = {
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

// Review
type BaseReview = {
    grade: Grade;
};

export type ReviewResponse = BaseReview & {
    id: number;
    date: string;
    reset: boolean;
    flashcard: FlashcardResponse;
};

export type ReviewRequest = BaseReview & {
    session: number;
};
