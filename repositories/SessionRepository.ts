import { AbstractRepository } from "./AbstractRepository";
import type { Filter, Pagination } from "~/types/request";
import type { Streak } from "~/types/data";
import type { SessionCountCriteria } from "~/types/countCriteria";
import type { Period } from "~/types/date";
import type { Session } from "~/types/entity";
import type { Paginated } from "~/types/response";

export class SessionRepository extends AbstractRepository
{
    async findAll(pagination: Partial<Pagination>, filter: Filter | null = null)
    {
        return this.fetch<Paginated<Session[]>>(`/sessions`, {
            method: "GET",
            query: {
                ...pagination,
                ...(filter ?? {})
            }
        });
    };

    async stop(id: number)
    {
        return this.fetch<Session>(`/sessions/${id}/stop`, {
            method: "POST",
        });
    }

    async count(criteria: SessionCountCriteria = "all", period?: Period)
    {
        return this.fetch<number>(`/sessions/count/${criteria}`, {
            method: "GET",
            query: {
                ...(period?.from ? { from: period.from } : {}),
                ...(period?.from ? { to: period.to } : {}),
            }
        });
    }

    async getStreak()
    {
        return this.fetch<Streak>(`/sessions/streak`, {
            method: "GET",
        });
    }

    async getTotalTimeInPractice()
    {
        return this.fetch<number>(`/sessions/practice-time`, {
            method: "GET",
        });
    }
}
