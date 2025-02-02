import type { TopicResponse } from "~/types/entity";

type State = {
    topics: TopicResponse[];
    total: number;
    collectionSelectedTopic?: TopicResponse;
};

export const useTopicStore = defineStore("topic", {
    persist: {
        pick: ["selectedTopic"]
    },
    state: (): State => ({
        topics: [],
        total: 0,
        collectionSelectedTopic: undefined
    }),
    actions: {
        find(id: number): TopicResponse | undefined
        {
            return this.topics.find(t => t.id === id);
        },
        prepend(item: TopicResponse)
        {
            this.topics = [item, ...this.topics];
        },
        append(item: TopicResponse)
        {
            this.topics = [...this.topics, item];
        },
        delete(item: TopicResponse)
        {
            const itemToRemove = this.topics.findIndex(t => t.id === item.id);
            this.topics.splice(itemToRemove, 1);
        },
        update(id: number, item: Partial<TopicResponse>)
        {
            const itemToUpdate = this.topics.findIndex(t => t.id === id);
            if (itemToUpdate !== -1)
            {
                const previousItem = this.topics[itemToUpdate];
                this.topics[itemToUpdate] = {
                    ...previousItem,
                    ...item
                };
            }
        },
        incrementTotal()
        {
            this.total++;
        },
        decrementTotal()
        {
            this.total--;
        }
    },
    getters: {}
});
