const { contextBridge, ipcRenderer } = require("electron");

// 렌더러 프로세스에서 사용할 API를 안전하게 노출
contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        // IPC 메서드들만 선택적으로 노출
        invoke: (channel, ...args) => {
            const validChannels = ["python:get-weather"];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
            throw new Error(`Unauthorized IPC channel: ${channel}`);
        },
        on: (channel, listener) => {
            const validChannels = ["python:get-weather"];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, listener);
            }
        },
        removeListener: (channel, listener) => {
            ipcRenderer.removeListener(channel, listener);
        },
    },
});

// DOM이 로드되면 콘솔에 로그 출력
window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM이 로드되었습니다");
});
