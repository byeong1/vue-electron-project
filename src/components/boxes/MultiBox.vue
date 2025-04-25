<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "MultiBox",
    props: {
        items: {
            type: Array as PropType<string[]>,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        gap: {
            type: Number,
            default: 8, // 박스 간 기본 간격(px)
        },
    },
});
</script>

<template>
    <div class="multi-box-wrapper" :style="{ gap: `${gap}px` }">
        <div
            v-for="(item, index) in items"
            :key="index"
            class="multi-box-item"
            :style="{ width: `${width}px`, height: `${height}px` }"
        >
            {{ item }}
        </div>
    </div>
</template>

<style scoped>
.multi-box-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.multi-box-item {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
    font-weight: bold;
    background-color: #f8f8f8;
    border-radius: 8px;
}
</style>
