<template>
    <BaseModal title="Keyboard shortcuts">
        <div
            class="flex flex-col gap-y-10 c-text-primary"
        >
            <div
                v-for="section in AppShortcutSections"
                :key="section.section"
            >
                <h4 class="text-lg font-bold mb-3">
                    {{ section.section }}
                </h4>

                <div class="flex flex-col gap-y-3">
                    <div
                        v-for="shortcut in section.shortcuts"
                        :key="shortcut.name"
                        class="flex justify-between"
                    >
                        <div>
                            <p class="text-md">
                                {{ shortcut.name }}
                            </p>
                            <span class="text-sm c-text-secondary">{{ shortcut.description }}</span>
                        </div>
                        <div class="shrink-0 flex gap-x-1">
                            <UKbd
                                v-for="shortcutKey in shortcut.shortcut"
                                :key="shortcutKey"
                                size="md"
                            >
                                {{ shortcutKey }}
                            </UKbd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseModal>
</template>
