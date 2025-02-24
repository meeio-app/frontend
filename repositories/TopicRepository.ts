import { AbstractRepository } from "./AbstractRepository";
import type { TopicRequest, TopicResponse } from "~/types/entity";
import type { Filter, Pagination } from "~/types/request";
import type { TopicCountCriteria } from "~/types/countCriteria";
import type { FlashcardSession } from "~/types/session";
import type { Paginated } from "~/types/response";

export class TopicRepository extends AbstractRepository
{
    async findAll(pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<TopicResponse[]>>("/topics", {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async find(id: number)
    {
        return this.fetch<TopicResponse>(`/topics/${id}`, {
            method: "GET"
        });
    };

    async create(topic: Partial<TopicRequest>)
    {
        return this.fetch<TopicResponse>("/topics", {
            method: "POST",
            body: {
                ...topic
            }
        });
    };

    async delete(id: number)
    {
        return this.fetch<null>(`/topics/${id}`, {
            method: "DELETE"
        });
    };

    async partialUpdate(id: number, updatedElement: Partial<TopicRequest>)
    {
        return this.fetch<TopicResponse>(`/topics/${id}`, {
            method: "PATCH",
            body: {
                ...updatedElement
            }
        });
    };

    async update(id: number, updatedElement: TopicRequest)
    {
        return this.partialUpdate(id, updatedElement);
    };

    async reset(id: number)
    {
        return this.fetch<null>(`/topics/${id}/reset`, {
            method: "POST"
        });
    };

    async session(id: number)
    {
        return this.fetch<FlashcardSession>(`/topics/${id}/session`, {
            method: "GET"
        });
    };

    async findRecent()
    {
        return this.fetch<TopicResponse[]>(`/topics/recent`, {
            method: "GET"
        });
    }

    async count(criteria: TopicCountCriteria = "all")
    {
        return this.fetch<number>(`/topics/count/${criteria}`, {
            method: "GET",
        });
    }
}
