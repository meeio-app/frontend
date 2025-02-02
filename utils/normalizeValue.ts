import type { Range } from "~/types/utils";

export default (value: number, originalRange: Range, newRange: Range) =>
{
    return newRange.min + (newRange.max - newRange.min) * (value - originalRange.min) / (originalRange.max - originalRange.min);
};
