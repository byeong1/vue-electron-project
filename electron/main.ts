import { app, BrowserWindow } from "electron";

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.NODE_ENV === "dev") {
        mainWindow.loadURL("http://localhost:5173");
    } else {
        mainWindow.loadFile("./dist/vue/index.html");
    }

    /* 개발 모드일 때 DevTools를 자동으로 열기 */
    // if (process.env.NODE_ENV === "dev") {
    mainWindow.webContents.openDevTools();
    // }
}

// Electron이 준비되면 창 생성
app.whenReady().then(createWindow);

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// macOS에서 dock 아이콘 클릭 시 창이 없으면 새 창 생성
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
