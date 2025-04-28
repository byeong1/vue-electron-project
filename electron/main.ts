import { app, BrowserWindow } from "electron";
import path from "path";

/* 창 생성 */
function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.NODE_ENV === "dev") {
        // Vite 서버의 포트를 환경 변수에서 가져오거나 기본값 사용
        const port = process.env.VITE_PORT || "5173";

        mainWindow.loadURL(`http://localhost:${port}`);
    } else {
        // 프로덕션 모드에서는 절대 경로를 사용
        const indexPath = path.join(__dirname, "../vue/index.html");
        mainWindow.loadFile(indexPath);
    }

    /* 개발 모드일 때 DevTools를 자동으로 열기 */
    if (process.env.NODE_ENV === "dev") {
        mainWindow.webContents.openDevTools();
    }
}

/* Electron이 준비되면 창 생성 */
app.whenReady().then(createWindow);

/* 모든 창이 닫히면 앱 종료 (macOS 제외) */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

/* macOS에서 dock 아이콘 클릭 시 창이 없으면 새 창 생성 */
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
