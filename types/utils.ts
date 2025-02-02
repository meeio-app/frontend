export type Nullable<T> = T | null;

export type Range = {
    min: number;
    max: number;
};

export type Collection = {
    type: "topic" | "unit";
    id: number;
};
