import { AbstractRepository } from "./AbstractRepository";
import type { ReviewCountCriteria } from "~/types/countCriteria";
import type { Review } from "~/types/entity";
import type { Period } from "~/types/date";
import type { Paginated } from "~/types/response";

export class ReviewRepository extends AbstractRepository
{
    async count(criteria: ReviewCountCriteria = "only-valid", period?: Period)
    {
        return this.fetch<number>(`/reviews/count/${criteria}`, {
            method: "GET",
            query: {
                ...(period?.from ? { from: period.from } : {}),
                ...(period?.from ? { to: period.to } : {}),
            }
        });
    }

    async findAllBySession(sessionId: number)
    {
        return this.fetch<Paginated<Review[]>>(`/sessions/${sessionId}/reviews`, {
            method: "GET",
        });
    }

    async countGroupByDate()
    {
        return this.fetch<{ date: string; total: number }[]>("/reviews/count/group_by_date", {
            method: "GET",
            query: {
                period: "last_30_days"
            }
        });
    }
}
