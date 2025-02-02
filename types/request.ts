export type PaginationOrder = "asc" | "desc";
export type Pagination = {
    sort: string;
    order: PaginationOrder;
    page: number;
    itemsPerPage: number;
};

export type Operator = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "like";
export const Operators: Record<string, Operator> = {
    Equal: "eq",
    NotEqual: "neq",
    LessThan: "lt",
    LessThanOrEqual: "lte",
    GreaterThan: "gt",
    GreaterThanOrEqual: "gte",
    Like: "like",
};

export type Filter = {
    filter: string;
    operator: Operator;
    value: unknown;
};
