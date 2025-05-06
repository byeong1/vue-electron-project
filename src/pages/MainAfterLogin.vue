<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import SingleBox from "@components/boxes/SingleBox.vue";

const router = useRouter();
const username = ref("사용자"); // 실제로는 로그인 시 받아온 값 사용

onMounted(() => {
    // 로그인 체크 (예시)
    if (!localStorage.getItem("access_token")) {
        router.push("/login");
    }
});

const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
};
</script>

<template>
    <div class="container">
        <SingleBox class="main-box">
            <h2>환영합니다, {{ username }}님!</h2>
            <p>이곳은 로그인 후 메인 페이지입니다.</p>
            <button class="logout-button" @click="handleLogout">로그아웃</button>
        </SingleBox>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
}
.main-box {
    width: 400px;
    padding: 40px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.logout-button {
    width: 100%;
    padding: 12px;
    margin-top: 20px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
}
</style>
