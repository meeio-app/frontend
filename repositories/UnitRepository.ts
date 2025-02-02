import { AbstractRepository } from "./AbstractRepository";
import type { UnitRequest, UnitResponse } from "~/types/entity";
import type { Filter, Pagination } from "~/types/request";
import type { UnitCountCriteria } from "~/types/countCriteria";
import type { FlashcardSession } from "~/types/session";
import type { Paginated } from "~/types/response";

export class UnitRepository extends AbstractRepository
{
    async findAll(pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<UnitResponse[]>>(`/units`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async find(id: number)
    {
        return this.fetch<UnitResponse>(`/units/${id}`, {
            method: "GET"
        });
    };

    async create(unit: Partial<UnitRequest>)
    {
        return this.fetch<UnitResponse>("/units", {
            method: "POST",
            body: {
                ...unit
            }
        });
    };

    async delete(id: number)
    {
        return this.fetch<null>(`/units/${id}`, {
            method: "DELETE"
        });
    };

    async partialUpdate(id: number, updatedElement: Partial<UnitRequest>)
    {
        return this.fetch<UnitResponse>(`/units/${id}`, {
            method: "PATCH",
            body: {
                ...updatedElement
            }
        });
    };

    async update(id: number, updatedElement: UnitRequest)
    {
        return this.partialUpdate(id, updatedElement);
    };

    async findByTopic(topicId: number, pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<UnitResponse[]>>(`/topics/${topicId}/units`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async reset(id: number)
    {
        return this.fetch<null>(`/units/${id}/reset`, {
            method: "PATCH"
        });
    };

    async session(id: number)
    {
        return this.fetch<FlashcardSession>(`/units/${id}/session`, {
            method: "GET"
        });
    };

    async findRecents()
    {
        return this.fetch<UnitResponse[]>(`/units/recent`, {
            method: "GET"
        });
    };

    async recentByTopic(id: number)
    {
        return this.fetch<Paginated<UnitResponse[]>>(`/topics/${id}/units/recent`, {
            method: "GET"
        });
    };

    async count(criteria: UnitCountCriteria = "all")
    {
        return this.fetch<number>(`/units/count/${criteria}`, {
            method: "GET",
        });
    };
}
