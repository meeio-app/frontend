import { AbstractRepository } from "./AbstractRepository";
import type { Filter, Pagination } from "~/types/request";
import type { FlashcardCountCriteria } from "~/types/countCriteria";
import type { Flashcard } from "~/types/entity";
import type { Paginated } from "~/types/response";
import type { FlashcardSession } from "~/types/session";

export class FlashcardRepository extends AbstractRepository
{
    async findAll(pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<Flashcard[]>>(`/flashcards`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async find(id: number)
    {
        return this.fetch<Flashcard>(`/flashcards/${id}`, {
            method: "GET"
        });
    };

    async create(unitId: number, unit: Partial<Flashcard>)
    {
        return this.fetch<Flashcard>("/flashcards", {
            method: "POST",
            body: {
                ...unit,
                unit: unitId
            }
        });
    };

    async delete(id: number)
    {
        return this.fetch<null>(`/flashcards/${id}`, {
            method: "DELETE"
        });
    };

    async partialUpdate(id: number, updatedElement: Partial<Flashcard>)
    {
        return this.fetch<Flashcard>(`/flashcards/${id}`, {
            method: "PATCH",
            body: {
                ...updatedElement
            }
        });
    };

    async update(id: number, updatedElement: Flashcard)
    {
        return this.partialUpdate(id, updatedElement);
    };

    async findByUnit(unitId: number, pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<Flashcard[]>>(`/units/${unitId}/flashcards`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async review(id: number, gradeType: number, sessionId: number)
    {
        return this.fetch<null>(`/flashcards/${id}/review`, {
            method: "POST",
            body: {
                grade: gradeType,
                session: sessionId
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
        return this.fetch<Flashcard>(`/flashcards/${id}/reset`, {
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
