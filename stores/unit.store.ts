import type { Unit } from "~/types/entity";

type State = {
    units: Unit[];
    total: number;
    collectionSelectedUnit?: Unit;
    collectionTotal: number;
};

export const useUnitStore = defineStore("unit", {
    persist: {
        pick: ["selectedUnit"]
    },
    state: (): State => ({
        units: [],
        total: 0,
        collectionSelectedUnit: undefined,
        collectionTotal: 0
    }),
    actions: {
        find(id: number): Unit | undefined
        {
            return this.units.find(u => u.id === id);
        },
        prepend(item: Unit)
        {
            this.units = [item, ...this.units];
        },
        append(item: Unit)
        {
            this.units = [...this.units, item];
        },
        delete(item: Unit)
        {
            const itemToRemove = this.units.findIndex(u => u.id === item.id);
            this.units.splice(itemToRemove, 1);
        },
        update(id: number, item: Partial<Unit>)
        {
            const itemToUpdate = this.units.findIndex(u => u.id === id);
            if (itemToUpdate !== -1)
            {
                const previousItem = this.units[itemToUpdate];
                this.units[itemToUpdate] = {
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
        },
        incrementCollectionTotal()
        {
            this.collectionTotal++;
        },
        decrementCollectionTotal()
        {
            this.collectionTotal--;
        }
    },
    getters: {}
});
