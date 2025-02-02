import { AbstractRepository } from "./AbstractRepository";
import type { Filter, Pagination } from "~/types/request";
import type { FlashcardCountCriteria } from "~/types/countCriteria";
import type { FlashcardRequest, FlashcardResponse, ReviewRequest } from "~/types/entity";
import type { Paginated } from "~/types/response";
import type { FlashcardSession } from "~/types/session";

export class FlashcardRepository extends AbstractRepository
{
    async findAll(pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<FlashcardResponse[]>>(`/flashcards`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async find(id: number)
    {
        return this.fetch<FlashcardResponse>(`/flashcards/${id}`, {
            method: "GET"
        });
    };

    async create(unit: Partial<FlashcardRequest>)
    {
        return this.fetch<FlashcardResponse>("/flashcards", {
            method: "POST",
            body: {
                ...unit,
            }
        });
    };

    async delete(id: number)
    {
        return this.fetch<null>(`/flashcards/${id}`, {
            method: "DELETE"
        });
    };

    async partialUpdate(id: number, updatedElement: Partial<FlashcardRequest>)
    {
        return this.fetch<FlashcardResponse>(`/flashcards/${id}`, {
            method: "PATCH",
            body: {
                ...updatedElement
            }
        });
    };

    async update(id: number, updatedElement: FlashcardRequest)
    {
        return this.partialUpdate(id, updatedElement);
    };

    async findByUnit(unitId: number, pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<FlashcardResponse[]>>(`/units/${unitId}/flashcards`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async review(id: number, review: ReviewRequest)
    {
        return this.fetch<null>(`/flashcards/${id}/review`, {
            method: "POST",
            body: {
                ...review
            }
        });
    };

    async resetAll()
    {
        return this.fetch<null>(`/flashcards/reset`, {
            method: "POST"
        });
    };

    async reset(id: number)
    {
        return this.fetch<FlashcardResponse>(`/flashcards/${id}/reset`, {
            method: "POST"
        });
    };

    async session()
    {
        return this.fetch<FlashcardSession>(`/flashcards/session`, {
            method: "GET"
        });
    };

    async count(criteria: FlashcardCountCriteria = "all")
    {
        return this.fetch<number>(`/flashcards/count/${criteria}`, {
            method: "GET",
        });
    };

    async averageGrade()
    {
        return this.fetch<number>(`/flashcards/averageGrade`, {
            method: "GET"
        });
    };
}
