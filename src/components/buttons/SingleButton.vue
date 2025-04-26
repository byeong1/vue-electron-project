<script setup lang="ts">
interface Props {
    label: string;
    color: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "click"): void;
}>();
</script>

<template>
    <button class="single-button" :class="[`button-${props.color}`]" @click="emit('click')">
        {{ props.label }}
    </button>
</template>

<style scoped>
.single-button {
    padding: 12px 24px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 200px;
}

.button-black {
    background-color: #2c3e50;
    color: white;
}

.button-black:hover {
    background-color: #34495f;
}

.button-white {
    background-color: white;
    color: #2c3e50;
    border: 1px solid #2c3e50;
}

.button-white:hover {
    background-color: #f8f9fa;
}

@media (max-width: 768px) {
    .single-button {
        padding: 10px 20px;
        font-size: 14px;
    }
}
</style>
