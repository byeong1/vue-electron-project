<template>
    <button class="btn" :style="{ backgroundColor: color }" @click="onClick">
        {{ label }}
    </button>
</template>

<script setup lang="ts">
defineProps({
    label: String,
    color: { type: String, default: "#4CAF50" },
    onClick: Function,
});
</script>

<style scoped>
.btn {
    padding: 10px 20px;
    border: none;
    color: white;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    border: 2px solid black;
}
</style>
