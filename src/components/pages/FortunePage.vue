<script setup lang="ts">
import { ref, computed } from "vue";
import SingleBox from "@components/boxes/SingleBox.vue";
import MultiButton from "@components/buttons/MultiButton.vue";
import { generateFortune } from "@/api/services/ollamaService";

interface FortuneSection {
    title: string;
    content: string;
}

const isLoading = ref(false);
const birthYear = ref("");
const birthMonth = ref("");
const birthDay = ref("");
const birthTime = ref("");
const selectedFortuneType = ref<number | null>(null);
const fortune = ref<FortuneSection[] | null>(null);

const fortuneTypeButtons = [
    { label: "일간 운세", value: "daily", color: "white" },
    { label: "주간 운세", value: "weekly", color: "white" },
    { label: "월간 운세", value: "monthly", color: "white" },
];

const isValidBirthDate = computed(() => {
    const year = Number(birthYear.value);
    const month = Number(birthMonth.value);
    const day = Number(birthDay.value);

    if (!year || !month || !day) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    return true;
});

const handleFortuneTypeSelect = (index: number) => {
    selectedFortuneType.value = index;
};

const generateFortuneResult = async () => {
    if (!isValidBirthDate.value || selectedFortuneType.value === null) return;

    isLoading.value = true;
    fortune.value = null;
    try {
        const birthDate = `${birthYear.value}-${String(birthMonth.value).padStart(2, "0")}-${String(birthDay.value).padStart(2, "0")}`;
        const fortuneType = fortuneTypeButtons[selectedFortuneType.value].value;
        const res = await generateFortune(birthDate, birthTime.value, fortuneType);
        fortune.value = [
            { title: "전체 운세", content: res.overall },
            { title: "금전운", content: res.money },
            { title: "건강운", content: res.health },
            { title: "인간관계운", content: res.relationship },
            { title: "조언", content: res.advice },
        ];
    } catch (error) {
        console.log("error :", error);
        alert("운세 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
        isLoading.value = false;
    }
};

const resetFortune = () => {
    fortune.value = null;
    selectedFortuneType.value = null;
    birthYear.value = "";
    birthMonth.value = "";
    birthDay.value = "";
    birthTime.value = "";
};
</script>

<template>
    <div class="fortune-page">
        <SingleBox variant="outlined" class="fortune-box">
            <h1 class="title">AI 운세</h1>
            <p class="subtitle">생년월일과 출생시간을 입력해 주세요. AI가 운세를 알려줘요!</p>
            <div v-if="!fortune" class="form-section">
                <div class="birth-info-form">
                    <div class="input-group">
                        <input
                            v-model="birthYear"
                            type="number"
                            placeholder="년도 (예: 1990)"
                            class="common-input"
                            :disabled="isLoading"
                        />
                        <input
                            v-model="birthMonth"
                            type="number"
                            placeholder="월 (1-12)"
                            class="common-input"
                            :disabled="isLoading"
                        />
                        <input
                            v-model="birthDay"
                            type="number"
                            placeholder="일 (1-31)"
                            class="common-input"
                            :disabled="isLoading"
                        />
                        <input
                            v-model="birthTime"
                            type="text"
                            placeholder="출생시간 (예: 14:30, 06:00 등)"
                            class="common-input"
                            :disabled="isLoading"
                        />
                    </div>

                    <div class="fortune-type-selector">
                        <MultiButton
                            :buttons="fortuneTypeButtons"
                            @button-click="handleFortuneTypeSelect"
                            :selected-button="selectedFortuneType"
                            :disabled-buttons="
                                isLoading ? fortuneTypeButtons.map((btn) => btn.value) : []
                            "
                        />
                    </div>

                    <button
                        class="common-button primary"
                        @click="generateFortuneResult"
                        :disabled="isLoading || !isValidBirthDate || selectedFortuneType === null"
                    >
                        {{ isLoading ? "운세 생성 중..." : "운세 보기" }}
                    </button>
                </div>
            </div>

            <div v-else-if="fortune" class="fortune-content">
                <div v-for="(section, idx) in fortune" :key="idx" class="fortune-section">
                    <h3>{{ section.title }}</h3>
                    <p>{{ section.content }}</p>
                </div>
                <button class="common-button secondary" @click="resetFortune">다시 보기</button>
            </div>

            <div v-if="isLoading" class="loading">운세를 생성하고 있습니다...</div>
        </SingleBox>
    </div>
</template>

<style scoped>
.fortune-page {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 40px;
}

.fortune-box {
    width: 100%;
    max-width: 600px;
}

.title {
    font-size: 2.5rem;
    font-weight: 900;
    color: var(--text-color);
    text-align: center;
    margin-bottom: 1rem;
    letter-spacing: 1px;
}

.subtitle {
    text-align: center;
    color: var(--text-secondary, #b0b0b0);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 2.5rem;
    line-height: 1.6;
    letter-spacing: 0.2px;
}

.form-section {
    text-align: center;
}

.birth-info-form h3 {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.fortune-type-selector {
    margin-bottom: 1.5rem;
}

.fortune-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.fortune-section {
    padding: 1.5rem;
    background: var(--button-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.fortune-section h3 {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 1rem;
    font-weight: 600;
}

.fortune-section p {
    color: var(--text-color);
    line-height: 1.6;
    white-space: pre-line;
    margin: 0;
}

.loading {
    text-align: center;
    color: var(--text-color);
    font-size: 1.1rem;
    margin: 2rem 0;
}

@media (max-width: 768px) {
    .title {
        font-size: 1.5rem;
    }

    .birth-info-form h3 {
        font-size: 1.1rem;
    }

    .fortune-section {
        padding: 1rem;
    }

    .fortune-section h3 {
        font-size: 1.1rem;
    }

    .fortune-section p {
        font-size: 0.9rem;
    }
}
</style>
