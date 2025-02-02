import type { Collection } from "~/types/utils";

export default async (collection?: Collection) =>
{
    const repository = useRepository();

    if (collection === undefined)
    {
        return await repository.flashcard.session();
    }

    switch (collection.type)
    {
        case "topic":
            return await repository.topic.session(collection.id);
        case "unit":
            return await repository.unit.session(collection.id);
        default:
            throw new Error(`Unknown collection type ${collection.type}`);
    }
};
