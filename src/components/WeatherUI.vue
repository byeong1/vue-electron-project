<script setup lang="ts">
import { ref, onMounted } from "vue";

// Electron ipcRenderer 가져오기 (Electron 환경에서만 동작)
// @ts-ignore
const ipcRenderer = window.electron.ipcRenderer;

// 날씨 정보 타입 정의
interface WeatherInfo {
    sky: string;
    temperature: string;
    raw_temp: number;
    city: string;
    humidity: number;
    wind_speed: number;
    timestamp: number;
    icon: string;
    raw_data: any;
    error?: string;
}

interface WeatherResponse {
    type: string;
    data: {
        message?: string;
        weather?: WeatherInfo;
        status?: string;
        url?: string;
    };
}

const loading = ref(false);
const error = ref("");
const result = ref<WeatherResponse | null>(null);
const weatherInfo = ref<WeatherInfo | null>(null);
const showSystemInfo = ref(false);

// 환경 확인 함수
const isElectron = (): boolean => {
    return ipcRenderer !== null;
};

// 컴포넌트 마운트 시 자동으로 날씨 정보 로드
onMounted(async () => {
    if (isElectron()) {
        await getWeatherInfo();
    } else {
        error.value = "이 기능은 Electron 환경에서만 사용 가능합니다.";
    }
});

/**
 * 날씨 정보 가져오기
 */
const getWeatherInfo = async () => {
    // 이전 결과 초기화
    error.value = "";
    weatherInfo.value = null;
    result.value = null;
    loading.value = true;

    try {
        if (!isElectron()) {
            throw new Error("이 기능은 Electron 환경에서만 사용 가능합니다.");
        }

        // FastAPI를 통해 날씨 정보 가져오기
        const response = await ipcRenderer.invoke("python:get-weather");
        result.value = response;

        if (response?.data?.weather) {
            weatherInfo.value = response.data.weather;

            // 오류 처리
            if (weatherInfo.value?.error) {
                error.value = weatherInfo.value.error;
                weatherInfo.value = null;
            }
        } else if (response?.type === "error") {
            error.value = response.data?.message || "날씨 정보를 가져오는데 실패했습니다.";
        }

        console.log("날씨 정보 결과:", response);
    } catch (err: any) {
        error.value = err.message || "알 수 없는 오류가 발생했습니다.";
        console.error("날씨 정보 오류:", err);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="weather-service-container">
        <h2>오늘의 날씨 정보</h2>

        <div v-if="loading" class="loading">
            <p>날씨 정보를 가져오는 중...</p>
        </div>

        <div v-if="error" class="error">
            <h3>오류 발생</h3>
            <pre>{{ error }}</pre>
            <button @click="getWeatherInfo" class="primary-btn">다시 시도</button>
        </div>

        <div v-if="weatherInfo" class="result">
            <div class="weather-card">
                <div class="weather-header">
                    <div class="location">{{ weatherInfo.city }}</div>
                    <div class="date-time">{{ new Date().toLocaleDateString() }}</div>
                </div>

                <div class="weather-content">
                    <div class="weather-icon">
                        <img
                            v-if="weatherInfo.icon"
                            :src="`http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`"
                            alt="날씨 아이콘"
                        />
                    </div>
                    <div class="weather-details">
                        <div class="temperature">{{ weatherInfo.temperature }}</div>
                        <div class="sky">{{ weatherInfo.sky }}</div>
                        <div class="details">
                            <span>습도: {{ weatherInfo.humidity }}%</span>
                            <span>풍속: {{ weatherInfo.wind_speed }}m/s</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-source">
                <p>* OpenWeatherMap API를 통해 제공되는 정보입니다.</p>
            </div>
        </div>

        <div v-if="showSystemInfo && result" class="system-info">
            <div class="debug">
                <h3>API 응답 전체 정보</h3>
                <pre class="json-data">{{ JSON.stringify(result, null, 2) }}</pre>
            </div>
        </div>

        <div class="toggle-debug">
            <button @click="showSystemInfo = !showSystemInfo" class="toggle-btn">
                {{ showSystemInfo ? "디버그 정보 숨기기" : "디버그 정보 보기" }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.weather-service-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.primary-btn {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 12px 24px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.primary-btn:hover {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.loading {
    margin: 20px 0;
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
    margin: 20px 0;
    padding: 20px;
    background-color: #ffebee;
    border-radius: 8px;
    border-left: 5px solid #f44336;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result {
    margin: 20px 0;
}

.weather-card {
    background-color: #f5f5f5;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.weather-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.weather-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 15px;
}

.location {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.date-time {
    color: #666;
    font-size: 16px;
}

.weather-content {
    display: flex;
    align-items: center;
}

.weather-icon {
    margin-right: 25px;
}

.weather-icon img {
    width: 100px;
    height: 100px;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.weather-details {
    flex: 1;
}

.temperature {
    font-size: 42px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
}

.sky {
    font-size: 22px;
    color: #555;
    margin-bottom: 15px;
}

.details {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 16px;
    color: #666;
}

.info-source {
    font-size: 12px;
    color: #777;
    margin-top: 15px;
    text-align: right;
    font-style: italic;
}

.system-info {
    margin-top: 30px;
}

.toggle-debug {
    margin-top: 30px;
    text-align: center;
}

.toggle-btn {
    background-color: #9e9e9e;
    font-size: 14px;
    padding: 8px 16px;
    border: none;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.toggle-btn:hover {
    background-color: #757575;
}

pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 10px 0;
    font-family: "Courier New", monospace;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.json-data {
    max-height: 300px;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .weather-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .weather-icon {
        margin: 0 0 20px 0;
    }

    .temperature {
        font-size: 36px;
    }
}
</style>
