<script setup lang="ts">
import type { IButtonOption } from "@/types";

type Props = {
    buttons: IButtonOption[];
    selectedButton: number | null;
    disabledButtons?: string[];
};

type Emits = {
    (e: "button-click", index: number, label: string, value: string): void;
};

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const handleClick = (index: number, button: IButtonOption): void => {
    if (isDisabled(button)) return;
    emit("button-click", index, button.label, button.value);
};

const isDisabled = (button: IButtonOption): boolean => {
    return !!(props.disabledButtons && props.disabledButtons.includes(button.value));
};
</script>

<template>
    <div class="multi-button-container">
        <button
            v-for="(button, index) in buttons"
            :key="index"
            class="multi-button"
            :class="[
                `button-${button.color}`,
                { selected: selectedButton === index, disabled: isDisabled(button) },
            ]"
            :disabled="isDisabled(button)"
            @click="handleClick(index, button)"
        >
            {{ isDisabled(button) && button.disabledLabel ? button.disabledLabel : button.label }}
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
    border: 2px solid #e74c3c;
}

.button-white:hover {
    background-color: #e74c3c;
    color: white;
}

.button-white.selected {
    background-color: #e74c3c;
    color: white;
    border: none;
}

.multi-button.disabled,
.multi-button[disabled] {
    cursor: not-allowed !important;
    pointer-events: none !important;
}

/* 비활성화 상태이면서 선택되지 않은 버튼 */
.multi-button.disabled:not(.selected),
.multi-button[disabled]:not(.selected) {
    background-color: #e0e0e0 !important;
    color: #999 !important;
    border: none !important;
}

/* 비활성화 상태이면서 선택된 버튼 */
.multi-button.disabled.selected,
.multi-button[disabled].selected {
    opacity: 0.8;
}

.multi-button.disabled:hover,
.multi-button[disabled]:hover {
    background-color: #e0e0e0 !important;
    color: #999 !important;
}

/* 선택된 버튼이 비활성화된 경우 hover 스타일 유지 */
.multi-button.disabled.selected:hover,
.multi-button[disabled].selected:hover {
    background-color: #e74c3c !important;
    color: white !important;
}

@media (max-width: 768px) {
    .multi-button {
        padding: 10px 20px;
        font-size: 14px;
        min-width: 100px;
    }
}
</style>
