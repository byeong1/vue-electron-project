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

<style scoped>
.box {
    display: flex;
    flex-direction: column;
    border: 2px solid black;
    background-color: antiquewhite;
    border-radius: 10px;
    padding: 20px;
    box-sizing: border-box;
}

.content {
    width: 100%;
    height: 100%;
}
</style>
