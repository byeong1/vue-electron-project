<script setup lang="ts"></script>

<template>
    <div class="container">
        <router-view />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center; /* 가로 중앙 정렬 */
    align-items: center; /* 세로 중앙 정렬 */
    min-height: 100vh; /* 최소 높이를 화면 크기로 설정 */
    width: 100%; /* 화면 전체 너비 */
    overflow: auto; /* 콘텐츠가 넘칠 경우 스크롤바 표시 */
    flex-direction: column; /* 세로로 정렬하기 */
}
</style>
