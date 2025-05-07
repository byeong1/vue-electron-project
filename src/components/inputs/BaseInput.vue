<template>
    <input
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="['common-input', customClass]"
    />
</template>

<script setup lang="ts">
defineProps<{
    modelValue: string | number;
    customClass?: string;
}>();
defineEmits(["update:modelValue"]);
</script>
