import type { UnitResponse } from "~/types/entity";

type State = {
    units: UnitResponse[];
    total: number;
    collectionSelectedUnit?: UnitResponse;
    collectionTotal: number;
};

export const useUnitStore = defineStore("unit", {
    persist: {
        pick: ["collectionSelectedUnit"]
    },
    state: (): State => ({
        units: [],
        total: 0,
        collectionSelectedUnit: undefined,
        collectionTotal: 0
    }),
    actions: {
        find(id: number): UnitResponse | undefined
        {
            return this.units.find(u => u.id === id);
        },
        prepend(item: UnitResponse)
        {
            this.units = [item, ...this.units];
        },
        append(item: UnitResponse)
        {
            this.units = [...this.units, item];
        },
        delete(item: UnitResponse)
        {
            const itemToRemove = this.units.findIndex(u => u.id === item.id);
            this.units.splice(itemToRemove, 1);
        },
        update(id: number, item: Partial<UnitResponse>)
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
