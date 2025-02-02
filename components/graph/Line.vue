<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from "@unovis/vue";
import { ref } from "vue";
import type { DataRecord } from "~/types/graph";

const props = defineProps<{
    data: DataRecord[];
    tooltipTemplate?: (d: DataRecord) => string;
    xTicks?: (i: number) => string;
}>();

const graphContainer = ref<HTMLElement | null>(null);
const { width, height } = useElementSize(graphContainer);

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.y;
</script>

<template>
    <!-- Using grid-cols-1 is a workaround to dynamically fix the width on the graph -->
    <div
        ref="graphContainer"
        class="w-full h-full grid grid-cols-1"
    >
        <VisXYContainer
            :data="data"
            :padding="{ top: 10 }"
            :height="height"
            :width="width"
        >
            <VisLine
                :data="data"
                color="rgb(var(--color-primary-DEFAULT))"
                :x="x"
                :y="y"
            />
            <VisArea
                :data="data"
                color="rgb(var(--color-primary-DEFAULT))"
                :x="x"
                :y="y"
                :opacity="0.1"
            />
            <VisAxis
                type="x"
                :x="x"
                :tick-format="props.xTicks"
            />

            <VisCrosshair
                v-if="props.tooltipTemplate"
                color="rgb(var(--color-primary-DEFAULT))"
                :template="props.tooltipTemplate"
            />

            <VisTooltip />
        </VisXYContainer>
    </div>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: rgb(var(--color-primary-500));
  --vis-crosshair-circle-stroke-color: #fff;

  --vis-axis-grid-color: rgb(var(--color-gray-200));
  --vis-axis-tick-color: rgb(var(--color-gray-200));
  --vis-axis-tick-label-color: rgb(var(--color-gray-400));

  --vis-tooltip-background-color: #fff;
  --vis-tooltip-border-color: rgb(var(--color-gray-200));
  --vis-tooltip-text-color: rgb(var(--color-gray-900));
}

.dark {
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: rgb(var(--color-primary-400));
    --vis-crosshair-circle-stroke-color: rgb(var(--color-gray-900));

    --vis-axis-grid-color: rgb(var(--color-gray-800));
    --vis-axis-tick-color: rgb(var(--color-gray-800));
    --vis-axis-tick-label-color: rgb(var(--color-gray-500));

    --vis-tooltip-background-color: rgb(var(--color-gray-900));
    --vis-tooltip-border-color: rgb(var(--color-gray-800));
    --vis-tooltip-text-color: #fff;
  }
}
</style>
