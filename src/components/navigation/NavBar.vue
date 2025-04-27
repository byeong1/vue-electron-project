<script setup lang="ts">
const props = defineProps<{
    tabs: { label: string; value: string; icon: string }[];
    modelValue: string;
}>();
const emit = defineEmits(["update:modelValue"]);

function onTabClick(value: string) {
    emit("update:modelValue", value);
}
</script>

<template>
    <nav class="top-nav">
        <div
            v-for="tab in tabs"
            :key="tab.value"
            :class="['nav-item', { active: modelValue === tab.value }]"
            @click="onTabClick(tab.value)"
        >
            <span class="icon" v-html="tab.icon"></span>
            <span class="label">{{ tab.label }}</span>
        </div>
    </nav>
</template>

<style scoped>
.top-nav {
    height: 70px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
    margin-top: 20px;
}
.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #bbb;
    font-size: 12px;
    flex: 1;
    cursor: pointer;
    transition:
        color 0.2s,
        background 0.2s;
    border-right: 1px solid black;
}
.nav-item:last-child {
    border-right: none;
}
.nav-item:hover {
    background: rgba(100, 100, 100, 0.08);
}
.nav-item.active {
    color: #222;
    background: rgba(100, 100, 100, 0.08);
}
.icon {
    font-size: 24px;
    margin-bottom: 2px;
}
</style>
