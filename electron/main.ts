import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { PythonWeatherService } from "./python-weather-service";

// 서비스 인스턴스
const weatherService: PythonWeatherService = new PythonWeatherService();

let mainWindow: BrowserWindow;

/**
 * Electron 앱의 메인 윈도우 생성 및 설정
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            sandbox: true,
            webSecurity: true,
        },
    });

    // 개발 모드 여부에 따라 로드할 URL 결정
    if (process.env.NODE_ENV === "dev") {
        // 개발 모드: 개발 서버 URL
        const port = process.env.ELECTRON_PORT || "5173";

        // 개발 환경에서도 CSP 설정
        mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    "Content-Security-Policy": [
                        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
                    ],
                },
            });
        });

        mainWindow.loadURL(`http://localhost:${port}`);
        // 개발자 도구 자동 열기
        // mainWindow.webContents.openDevTools();
    } else {
        // 프로덕션 모드: 빌드된 파일 로드
        mainWindow.loadFile(path.join(__dirname, "../vue/index.html"));
    }

    mainWindow.webContents.openDevTools();
}

/**
 * IPC 핸들러 설정 - 렌더러 프로세스와 통신
 */
function setupIpcHandlers() {
    ipcMain.handle("get-weather", async (): Promise<any> => {
        try {
            console.log("IPC: 날씨 정보 요청 받음");
            const weather = await weatherService.getWeatherFromApi();
            console.log("IPC: 날씨 정보 조회 성공");
            return weather;
        } catch (error) {
            console.error("IPC: 날씨 정보 조회 실패:", error);
            return { error: "날씨 정보를 가져오는 중 오류가 발생했습니다." };
        }
    });
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
    createWindow();
    setupIpcHandlers();

    // macOS에서 모든 창이 닫혔을 때 새 창 생성
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 모든 창이 닫히면 앱 종료 (Windows, Linux)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// 앱 종료 시 리소스 정리
app.on("will-quit", () => {
    console.log("앱 종료 - 리소스 정리 중...");
    weatherService.dispose();
});

// 에러 핸들링
process.on("uncaughtException", (error) => {
    console.error("처리되지 않은 예외:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("처리되지 않은 Promise 거부:", reason);
});
