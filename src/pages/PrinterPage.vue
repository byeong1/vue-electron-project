<script setup lang="ts">
import { ref, onMounted } from "vue";

// Electron의 직접 import는 Vite 클라이언트에서 문제를 일으킴
// import { ipcRenderer } from "electron";

// window 객체를 통해 접근
declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                invoke: (channel: string, ...args: any[]) => Promise<any>;
                on: (channel: string, listener: (...args: any[]) => void) => void;
            };
        };
    }
}

// 안전하게 ipcRenderer 접근 (없으면 mock 함수 사용)
const ipcRenderer = window.electron?.ipcRenderer || {
    invoke: async () => {
        console.warn("ipcRenderer가 없습니다. 개발 환경에서는 더미 데이터를 반환합니다.");
        return [];
    },
    on: () => {
        console.warn("ipcRenderer가 없습니다.");
    },
};

interface PrinterInfo {
    name?: string;
    ip?: string;
    host?: string;
    port?: number;
    type?: string;
    uri?: string;
}

const printers = ref<PrinterInfo[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const manualIpAddress = ref<string>("");
const manualPrinterName = ref<string>("");
const manualPort = ref<number>(631);
const manualType = ref<string>("IPP");

onMounted(() => {
    // 초기 로드 시 에러 처리 개선
    try {
        scanPrinters();

        // IPC 이벤트 리스너 설정
        ipcRenderer.on("printer-auto-scan-completed", (event, newPrinters) => {
            if (newPrinters && newPrinters.length > 0) {
                printers.value = newPrinters;
                console.log("자동으로 발견된 프린터:", newPrinters);
            }
        });
    } catch (err) {
        console.error("초기 프린터 스캔 실패:", err);
        error.value = "초기 프린터 스캔 중 오류가 발생했습니다. 수동으로 다시 스캔해 주세요.";
    }
});

const scanPrinters = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        // 타임아웃 설정 (30초)
        const timeoutPromise = new Promise<PrinterInfo[]>((_, reject) => {
            setTimeout(() => reject(new Error("프린터 검색 시간 초과")), 30000);
        });

        // 프린터 검색 요청
        const printerPromise = ipcRenderer.invoke("scan-printers");

        // 둘 중 먼저 완료되는 것으로 처리
        const foundPrinters = await Promise.race([printerPromise, timeoutPromise]);
        printers.value = foundPrinters;

        // 결과 알림
        if (foundPrinters.length > 0) {
            console.log(`${foundPrinters.length}개의 프린터 발견!`, foundPrinters);
        } else {
            console.log("프린터를 찾지 못했습니다");
        }
    } catch (err: any) {
        console.error("프린터 검색 오류:", err);
        error.value = `프린터 검색 중 오류가 발생했습니다: ${err.message || err}`;
        printers.value = []; // 오류 발생 시 빈 배열로 초기화
    } finally {
        isLoading.value = false;
    }
};

const testPrinter = async (printer: PrinterInfo) => {
    try {
        // 깊은 복사를 피하기 위해 필요한 정보만 전달
        const printerInfo = {
            name: printer.name,
            ip: printer.ip,
            host: printer.host,
            port: printer.port,
            type: printer.type,
            uri: printer.uri,
        };

        const success = await ipcRenderer.invoke("test-printer", { printer: printerInfo });
        if (success) {
            alert(
                `${printer.name || printer.ip} 프린터로 테스트 이미지 인쇄를 시도했습니다.\n\n프린터에서 출력물을 확인해주세요.`,
            );
        } else {
            alert(
                `${printer.name || printer.ip} 프린터 테스트 실패. 프린터가 켜져 있고 네트워크에 연결되어 있는지 확인하세요.`,
            );
        }
    } catch (err: any) {
        console.error("프린터 테스트 오류:", err);
        alert(`프린터 테스트 오류: ${err.message || err}`);
    }
};

// 수동으로 IP 주소를 입력하여 프린터 추가
const addManualPrinter = () => {
    if (!manualIpAddress.value && !manualPrinterName.value) {
        alert("IP 주소 또는 프린터 이름을 입력해주세요");
        return;
    }

    if (manualIpAddress.value) {
        // IP 주소 입력한 경우 - 간단한 IP 주소 형식 검증
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(manualIpAddress.value)) {
            alert("유효한 IP 주소 형식이 아닙니다 (예: 192.168.1.100)");
            return;
        }
    }

    // 수동 프린터 추가
    const manualPrinter: PrinterInfo = {
        name: manualPrinterName.value || `프린터 (${manualIpAddress.value || "수동 추가"})`,
        ip: manualIpAddress.value || undefined,
        port: manualPort.value,
        type: manualType.value as any,
        uri: manualIpAddress.value
            ? `${manualType.value.toLowerCase()}://${manualIpAddress.value}:${manualPort.value}/ipp/print`
            : undefined,
    };

    // 중복 확인
    const isDuplicate = printers.value.some(
        (p) =>
            (manualIpAddress.value && p.ip === manualIpAddress.value) ||
            (manualPrinterName.value && p.name === manualPrinterName.value),
    );

    if (!isDuplicate) {
        printers.value.push(manualPrinter);
        // 입력 필드 초기화
        manualIpAddress.value = "";
        manualPrinterName.value = "";
        manualPort.value = 631;
        manualType.value = "IPP";
    } else {
        alert("이미 추가된 프린터입니다");
    }
};

// 프린터 타입을 읽기 쉬운 텍스트로 변환
const getPrinterTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
        IPP: "IPP/AirPrint",
        Raw: "Raw/USB",
        Bonjour: "Bonjour/AirPrint",
        System: "시스템 등록 프린터",
    };
    return typeMap[type] || type;
};

// 프린터 타입에 따라 아이콘 표시
const getPrinterIcon = (type: string): string => {
    const typeMap: Record<string, string> = {
        IPP: "🖨️",
        Raw: "🖨️",
        Bonjour: "🍎",
        System: "💻",
    };
    return typeMap[type] || "🖨️";
};
</script>

<template>
    <div class="printer-page">
        <h1>프린터 관리</h1>

        <div class="actions">
            <button @click="scanPrinters" :disabled="isLoading" class="btn primary">
                {{ isLoading ? "검색 중..." : "프린터 검색" }}
            </button>

            <div class="manual-input-container">
                <h3>수동으로 프린터 추가</h3>

                <div class="input-group">
                    <label>프린터 이름:</label>
                    <input
                        v-model="manualPrinterName"
                        placeholder="프린터 이름 (선택사항)"
                        type="text"
                        :disabled="isLoading"
                    />
                </div>

                <div class="input-group">
                    <label>IP 주소:</label>
                    <input
                        v-model="manualIpAddress"
                        placeholder="프린터 IP 주소 (예: 192.168.1.100)"
                        type="text"
                        :disabled="isLoading"
                    />
                </div>

                <div class="input-row">
                    <div class="input-group">
                        <label>포트:</label>
                        <input
                            v-model.number="manualPort"
                            type="number"
                            min="1"
                            max="65535"
                            :disabled="isLoading"
                        />
                    </div>

                    <div class="input-group">
                        <label>유형:</label>
                        <select v-model="manualType" :disabled="isLoading">
                            <option value="IPP">IPP/AirPrint</option>
                            <option value="Raw">Raw/USB</option>
                            <option value="Bonjour">Bonjour</option>
                            <option value="System">시스템</option>
                        </select>
                    </div>
                </div>

                <button @click="addManualPrinter" :disabled="isLoading" class="btn secondary">
                    프린터 추가
                </button>
            </div>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
            <p class="error-tip">
                도움말: 네트워크 프린터가 켜져 있고 동일한 네트워크에 연결되어 있는지 확인하세요.
            </p>
        </div>

        <div v-if="isLoading" class="loading">
            <div class="spinner"></div>
            <p>프린터를 검색하는 중입니다...<br />최대 30초 정도 소요될 수 있습니다.</p>
        </div>

        <div v-else>
            <div v-if="printers.length === 0" class="no-printers">
                <p>발견된 프린터가 없습니다.</p>
                <p class="help-text">
                    프린터가 켜져 있고 네트워크에 연결되어 있는지 확인하세요.<br />
                    AirPrint 프린터는 시스템 환경설정에 등록되어 있어야 합니다.<br />
                    프린터의 IP 주소나 이름을 알고 있다면 수동으로 추가할 수 있습니다.
                </p>
            </div>

            <div v-else class="printer-list">
                <h2>발견된 프린터 ({{ printers.length }})</h2>

                <div v-for="(printer, index) in printers" :key="index" class="printer-card">
                    <div class="printer-info">
                        <h3>
                            <span class="printer-icon">{{ getPrinterIcon(printer.type) }}</span>
                            {{ printer.name || "이름 없음" }}
                        </h3>
                        <p>
                            <strong>IP/호스트:</strong>
                            {{ printer.ip || printer.host || "알 수 없음" }}<br />
                            <strong>포트:</strong> {{ printer.port || "기본" }}<br />
                            <strong>타입:</strong> {{ getPrinterTypeDisplay(printer.type) }}<br />
                            <strong>URI:</strong> {{ printer.uri || "없음" }}
                        </p>
                    </div>
                    <div class="printer-actions">
                        <button @click="testPrinter(printer)" class="btn secondary">
                            테스트 인쇄
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.printer-page {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
    color: var(--primary-color);
}

.actions {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.manual-input-container {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    background-color: var(--bg-card);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.manual-input-container h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-primary);
    font-size: 1rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

.input-group label {
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.input-group input,
.input-group select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
}

.input-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
}

.input-row .input-group {
    flex: 1;
}

.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.primary {
    background-color: var(--primary-color);
    color: white;
}

.primary:hover:not(:disabled) {
    background-color: var(--primary-dark);
}

.secondary {
    background-color: var(--secondary-color);
    color: white;
}

.secondary:hover:not(:disabled) {
    background-color: var(--secondary-dark);
}

.error-message {
    padding: 10px;
    background-color: #ffebee;
    color: #c62828;
    border-radius: 4px;
    margin-bottom: 20px;
}

.error-tip {
    font-size: 0.9em;
    margin-top: 8px;
    color: #e57373;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 40px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.no-printers {
    text-align: center;
    margin: 40px 0;
    color: var(--text-secondary);
}

.help-text {
    margin-top: 10px;
    font-size: 0.9em;
    color: var(--text-secondary);
}

.printer-list {
    margin-top: 20px;
}

.printer-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: var(--bg-card);
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.printer-info {
    flex: 1;
}

.printer-info h3 {
    margin-bottom: 8px;
    color: var(--text-primary);
}

.printer-info p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.printer-actions {
    margin-left: 16px;
}

.printer-icon {
    margin-right: 8px;
    font-size: 1.2em;
}

.loading p {
    text-align: center;
    margin-top: 10px;
    color: var(--text-secondary);
}
</style>
