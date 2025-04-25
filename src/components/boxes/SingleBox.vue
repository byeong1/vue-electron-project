<template>
    <div
        class="box"
        :style="{ width: width ? width + 'px' : 'auto', height: height ? height + 'px' : 'auto' }"
    >
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        width: {
            type: Number,
            required: false,
            default: null,
        },
        height: {
            type: Number,
            required: false,
            default: null,
        },
    },
};
</script>

<style scoped>
.box {
    display: inline-flex; /* 내용에 맞게 크기 조정 */
    justify-content: center;
    align-items: center;
    border: 2px solid black;
    background-color: antiquewhite;
    border-radius: 10px;
    padding: 16px; /* 박스 내부 여백 추가 */
}

.content {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
