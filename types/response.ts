export type Pagination = {
    total: number;
    itemsPerPage: number;
    count: number;
    totalpages: number;
    page: number;
    offset: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type Paginated<TData> = {
    pagination: Pagination;
    data: TData;
};
