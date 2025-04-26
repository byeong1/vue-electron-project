<script setup lang="ts">
import type { ButtonOptionType } from "@/types/components/buttonType";

interface Props {
    buttons: ButtonOptionType[];
    selectedButton: number | null;
}

interface Emits {
    (e: "button-click", index: number, label: string, value: string): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const handleClick = (index: number, button: ButtonOptionType): void => {
    emit("button-click", index, button.label, button.value);
};
</script>

<template>
    <div class="multi-button-container">
        <button
            v-for="(button, index) in buttons"
            :key="index"
            class="multi-button"
            :class="[`button-${button.color}`, { selected: selectedButton === index }]"
            @click="handleClick(index, button)"
        >
            {{ button.label }}
        </button>
    </div>
</template>

<style scoped>
.multi-button-container {
    display: flex;
    gap: 16px;
    width: 100%;
}

.multi-button {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
}

.button-white {
    background-color: white;
    color: #2c3e50;
    border: 1px solid #2c3e50;
}

.button-white:hover {
    background-color: #f39c12;
}

.button-white.selected {
    background-color: #f39c12;
    color: white;
    border: none;
}

@media (max-width: 768px) {
    .multi-button {
        padding: 10px 20px;
        font-size: 14px;
        min-width: 100px;
    }
}
</style>
