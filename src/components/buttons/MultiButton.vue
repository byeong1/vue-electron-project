<template>
    <div class="button-group">
        <button
            v-for="(button, index) in buttons"
            :key="index"
            :style="{ backgroundColor: button.color }"
            :class="{ selected: selectedButton === index }"
            @click="handleClick(index, button.label, button.value)"
        >
            {{ button.label }}
        </button>
    </div>
</template>

<script>
export default {
    props: {
        buttons: {
            type: Array,
            required: true,
        },
        selectedButton: {
            type: Number,
            default: null,
        },
    },
    methods: {
        handleClick(index, label, value) {
            this.$emit("button-click", index, label, value); // 버튼 클릭 시 이벤트 발생
        },
    },
};
</script>

<style scoped>
.button-group {
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 20px;
    border: 2px solid black;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button.selected {
    background-color: #f39c12;
    color: white;
}

button:hover {
    background-color: #bdc3c7;
}
</style>
