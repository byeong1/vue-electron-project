<script setup lang="ts">
import { ref, onMounted } from "vue";
import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import { generateFortune } from "@api/services/ollamaService";

import type { IButtonOption } from "@types";

interface IFortuneData {
    overall: string;
    money: string;
    health: string;
    relationship: string;
    advice: string;
}

const fortuneTypes: IButtonOption[] = [
    {
        label: "오늘의 운세",
        value: "daily",
        color: "white",
    },
    {
        label: "주간 운세",
        value: "weekly",
        color: "white",
    },
    {
        label: "월간 운세",
        value: "monthly",
        color: "white",
    },
];

const selectedFortuneType = ref<string>("daily");
const fortuneData = ref<IFortuneData | null>(null);
const isLoading = ref<boolean>(false);
const showFortune = ref<boolean>(false);

// 생년월일 입력 관련 상태
const birthDate = ref<string>("");
const birthTime = ref<string>("");
const isBirthInfoSubmitted = ref<boolean>(false);

const handleFortuneTypeChange = (index: number, label: string, value: string): void => {
    selectedFortuneType.value = value;
    if (isBirthInfoSubmitted.value) {
        generateFortuneContent();
    }
};

const handleBirthInfoSubmit = async (): Promise<void> => {
    if (!birthDate.value || !birthTime.value) {
        alert("생년월일과 시간을 모두 입력해주세요.");
        return;
    }
    isBirthInfoSubmitted.value = true;
    await generateFortuneContent();
};

const generateFortuneContent = async (): Promise<void> => {
    if (!isBirthInfoSubmitted.value) return;

    isLoading.value = true;
    try {
        const response = await generateFortune(
            birthDate.value,
            birthTime.value,
            selectedFortuneType.value,
        );
        fortuneData.value = response as IFortuneData;
        showFortune.value = true;
    } catch (error) {
        console.error("운세 생성 중 오류 발생:", error);
        alert("운세를 생성하는데 실패했습니다.");
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    // 페이지 로드 시 초기화
    birthDate.value = "";
    birthTime.value = "";
    isBirthInfoSubmitted.value = false;
    showFortune.value = false;
});
</script>

<template>
    <div class="fortune-container">
        <SingleBox class="fortune-box">
            <div class="fortune-header">
                <h2>오늘의 운세</h2>
            </div>

            <div v-if="!isBirthInfoSubmitted" class="birth-info-form">
                <h3>생년월일을 입력해주세요</h3>
                <div class="input-group">
                    <input
                        type="date"
                        v-model="birthDate"
                        class="birth-input"
                        placeholder="생년월일"
                    />
                    <input
                        type="time"
                        v-model="birthTime"
                        class="birth-input"
                        placeholder="출생 시간"
                    />
                </div>
                <button @click="handleBirthInfoSubmit" class="submit-button">운세 보기</button>
            </div>

            <div v-else>
                <div class="fortune-type-selector">
                    <MultiButton
                        :buttons="fortuneTypes"
                        @button-click="handleFortuneTypeChange"
                        :selected-button="
                            fortuneTypes.findIndex((type) => type.value === selectedFortuneType)
                        "
                    />
                </div>

                <div v-if="isLoading" class="loading">운세를 생성하는 중...</div>
                <div v-else-if="showFortune && fortuneData" class="fortune-content">
                    <div class="fortune-section">
                        <h3>전체 운세</h3>
                        <p>{{ fortuneData.overall }}</p>
                    </div>
                    <div class="fortune-section">
                        <h3>금전운</h3>
                        <p>{{ fortuneData.money }}</p>
                    </div>
                    <div class="fortune-section">
                        <h3>건강운</h3>
                        <p>{{ fortuneData.health }}</p>
                    </div>
                    <div class="fortune-section">
                        <h3>인간관계운</h3>
                        <p>{{ fortuneData.relationship }}</p>
                    </div>
                    <div class="fortune-section">
                        <h3>조언</h3>
                        <p>{{ fortuneData.advice }}</p>
                    </div>
                </div>
            </div>
        </SingleBox>
    </div>
</template>

<style scoped>
.fortune-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.fortune-box {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 24px;
}

.fortune-header {
    text-align: center;
    margin-bottom: 24px;
}

.fortune-header h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 16px;
}

.birth-info-form {
    text-align: center;
}

.birth-info-form h3 {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.birth-input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
}

.submit-button {
    background-color: #4caf50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #45a049;
}

.fortune-type-selector {
    margin-bottom: 24px;
}

.fortune-content {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
}

.fortune-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.fortune-section h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 12px;
}

.fortune-section p {
    margin: 0;
    white-space: pre-line;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 18px;
    color: #666;
}
</style>
