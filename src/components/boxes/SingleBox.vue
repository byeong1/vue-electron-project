<script setup lang="ts">
type Props = {
    width?: number;
    height?: number;
    variant?: "default" | "outlined";
};

const props = withDefaults(defineProps<Props>(), {
    width: undefined,
    height: undefined,
    variant: "default",
});
</script>

<template>
    <div
        class="box"
        :class="variant"
        :style="{
            width: width ? width + 'px' : 'auto',
            height: height ? height + 'px' : 'auto',
        }"
    >
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.box {
    display: flex;
    flex-direction: column;
    background-color: var(--box-bg);
    border-radius: 12px;
    padding: 40px;
    box-sizing: border-box;
    box-shadow: var(--box-shadow);
    transition: all 0.3s ease;
}

.box.outlined {
    border: 1px solid var(--border-color);
}

.content {
    width: 100%;
    height: 100%;
}

@media (max-width: 768px) {
    .box {
        padding: 20px;
    }
}
</style>
