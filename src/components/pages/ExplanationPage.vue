<script>
import SingleBox from "@components/boxes/SingleBox.vue";

export default {
    components: {
        SingleBox,
    },
};
</script>

<style scoped>
SingleBox {
    width: 100%; /* Box 컴포넌트가 부모에 맞게 크기를 조정 */
    max-width: 500px; /* 최대 너비 설정 */
    height: auto; /* 높이 비율을 자동으로 유지 */
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 768px) {
    SingleBox {
        width: 100%;
        max-width: 100%; /* 화면 크기에 맞게 너비가 100%로 변하도록 */
        height: auto;
    }
}
</style>

<template>
    <h1>풀이 화면</h1>
    <SingleBox :width="500" :height="1000" />
</template>
