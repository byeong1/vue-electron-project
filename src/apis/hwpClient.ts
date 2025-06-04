/**
 * 한글(HWP) API 클라이언트
 * Electron 환경에서 IPC를 통해 한글 API와 통신
 */

// Electron ipcRenderer 가져오기 (Electron 환경에서만 동작)
// @ts-ignore
const ipcRenderer = window.require ? window.require("electron").ipcRenderer : null;

// 환경 확인 함수
const isElectron = (): boolean => {
    return ipcRenderer !== null;
};

/**
 * 한글 파일 열기
 * @param filePath 열고자 하는 파일 경로
 */
export const openHwpFile = async (filePath: string): Promise<any> => {
    if (!isElectron()) {
        throw new Error("이 기능은 Electron 환경에서만 사용 가능합니다.");
    }

    try {
        return await ipcRenderer.invoke("hwp:open-file", filePath);
    } catch (error: any) {
        console.error("한글 파일 열기 오류:", error);
        throw new Error(`한글 파일 열기 실패: ${error.message}`);
    }
};

/**
 * 한글 파일 저장
 * @param filePath 저장할 파일 경로
 */
export const saveHwpFile = async (filePath: string): Promise<any> => {
    if (!isElectron()) {
        throw new Error("이 기능은 Electron 환경에서만 사용 가능합니다.");
    }

    try {
        return await ipcRenderer.invoke("hwp:save-file", filePath);
    } catch (error: any) {
        console.error("한글 파일 저장 오류:", error);
        throw new Error(`한글 파일 저장 실패: ${error.message}`);
    }
};

/**
 * 한글 문서에 텍스트 삽입
 * @param text 삽입할 텍스트
 */
export const insertTextToHwp = async (text: string): Promise<any> => {
    if (!isElectron()) {
        throw new Error("이 기능은 Electron 환경에서만 사용 가능합니다.");
    }

    try {
        return await ipcRenderer.invoke("hwp:insert-text", text);
    } catch (error: any) {
        console.error("한글 텍스트 삽입 오류:", error);
        throw new Error(`한글 텍스트 삽입 실패: ${error.message}`);
    }
};

/**
 * 한글 종료
 */
export const closeHwp = async (): Promise<any> => {
    if (!isElectron()) {
        throw new Error("이 기능은 Electron 환경에서만 사용 가능합니다.");
    }

    try {
        return await ipcRenderer.invoke("hwp:close");
    } catch (error: any) {
        console.error("한글 종료 오류:", error);
        throw new Error(`한글 종료 실패: ${error.message}`);
    }
};

// 기본 내보내기
export default {
    openHwpFile,
    saveHwpFile,
    insertTextToHwp,
    closeHwp,
    isElectron,
};
