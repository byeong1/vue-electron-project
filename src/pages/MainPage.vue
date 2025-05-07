<script setup lang="ts">
import { SingleBox } from "@/components";
</script>

<template>
    <div class="main-page">
        <h1 class="title">Vue.js 수학 문제 생성 AI 프로젝트</h1>

        <img src="@/assets/logo.png" alt="로고" class="logo" />

        <SingleBox variant="outlined" class="info-box">
            <div class="info-title">AI 학습 안내</div>
            <ul class="info-list">
                <li>로그인 후 <b>문제</b>를 <b>AI</b>에게 학습시킬 수 있습니다.</li>
                <li>
                    현재는 <span class="test-mode">테스트 모드</span>로, 학습 문제는
                    <b class="limit">10개</b>로 제한됩니다.
                </li>
            </ul>
        </SingleBox>
    </div>
</template>

<style scoped>
.main-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
}

.title {
    font-size: 2.5rem;
    font-weight: 900;
    color: var(--text-color);
    text-align: center;
    margin: 0;
    transition: color 0.3s ease;
}

.logo {
    width: 300px;
    height: 300px;
    object-fit: contain;
}

.info-box {
    width: 100%;
    max-width: 600px;
}

.info-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--button-primary);
    margin-bottom: 1rem;
}

.info-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.info-list li {
    color: var(--text-color);
    font-size: 1.1rem;
    line-height: 1.6;
}

.test-mode {
    color: var(--button-primary);
    font-weight: bold;
}

.limit {
    color: var(--button-primary);
    font-weight: bold;
}

@media (max-width: 768px) {
    .title {
        font-size: 2rem;
        padding: 0 20px;
    }

    .logo {
        width: 200px;
        height: 200px;
    }
}
</style>
