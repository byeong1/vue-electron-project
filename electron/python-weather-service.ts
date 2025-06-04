import { spawn, ChildProcess } from "child_process";
import { app, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import axios from "axios";

/**
 * Python 날씨 정보 서비스
 */
export class PythonWeatherService {
    private pythonProcess: ChildProcess | null = null;
    private fastApiServer: ChildProcess | null = null;
    private apiBaseUrl = "http://127.0.0.1:8000";
    private isApiServerRunning = false;
    private apiPort = 8000;
    private maxPortAttempts = 5;
    private serverPid: number | null = null;
    private isInstallingDependencies = false;
    private dependenciesInstalled = false;

    constructor() {
        // 앱 시작 시 Python 환경 확인 및 의존성 설치
        this.checkPythonEnvironment();

        // IPC 이벤트 리스너 설정
        this.setupIpcListeners();

        // 앱 실행 시 자동으로 서버 시작
        this.startFastApiServer();

        // 앱 종료 시 서버 중지
        app.on("will-quit", () => {
            this.stopFastApiServer();
        });

        // Ctrl+C 등의 시그널 처리
        process.on("SIGINT", () => {
            console.log("SIGINT 시그널 감지: 프로세스 정리 중...");
            this.stopFastApiServer();
            process.exit(0);
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM 시그널 감지: 프로세스 정리 중...");
            this.stopFastApiServer();
            process.exit(0);
        });
    }

    /**
     * Python 환경 확인 및 필요한 의존성 설치
     */
    private async checkPythonEnvironment(): Promise<void> {
        try {
            // Python 실행 파일 확인
            const pythonExecutable = this.getPythonExecutablePath();

            // Python 버전 확인
            const pythonVersionProcess = spawn(pythonExecutable, ["--version"]);

            let versionOutput = "";
            pythonVersionProcess.stdout?.on("data", (data) => {
                versionOutput += data.toString();
            });

            await new Promise<void>((resolve) => {
                pythonVersionProcess.on("close", (code) => {
                    if (code === 0) {
                        console.log(`Python 버전: ${versionOutput.trim()}`);
                        resolve();
                    } else {
                        console.error("Python 버전 확인 실패");
                        this.showPythonError();
                        resolve();
                    }
                });
            });

            // 필요한 패키지 설치
            await this.installPythonDependencies();
        } catch (error) {
            console.error("Python 환경 확인 실패:", error);
            this.showPythonError();
        }
    }

    /**
     * Python 오류 메시지 표시
     */
    private showPythonError(): void {
        dialog.showErrorBox(
            "Python 오류",
            "Python 실행 환경을 찾을 수 없습니다. Python 3.8 이상이 설치되어 있는지 확인해주세요.",
        );
    }

    /**
     * Python 의존성 패키지 설치
     */
    private async installPythonDependencies(): Promise<void> {
        // 이미 설치 중이거나 설치 완료된 경우 건너뜀
        if (this.isInstallingDependencies || this.dependenciesInstalled) {
            return;
        }

        this.isInstallingDependencies = true;

        try {
            const pythonExecutable = this.getPythonExecutablePath();
            const requirementsFile = this.getRequirementsFilePath();

            if (!fs.existsSync(requirementsFile)) {
                console.error(`의존성 파일을 찾을 수 없습니다: ${requirementsFile}`);
                this.isInstallingDependencies = false;
                return;
            }

            console.log(`Python 의존성 설치 중... (${requirementsFile})`);

            // pip 업그레이드
            const pipUpgradeProcess = spawn(pythonExecutable, [
                "-m",
                "pip",
                "install",
                "--upgrade",
                "pip",
            ]);

            await new Promise<void>((resolve) => {
                pipUpgradeProcess.on("close", (code) => {
                    console.log(`pip 업그레이드 ${code === 0 ? "성공" : "실패"}`);
                    resolve();
                });
            });

            // 의존성 설치
            const installProcess = spawn(pythonExecutable, [
                "-m",
                "pip",
                "install",
                "-r",
                requirementsFile,
                "--user",
            ]);

            installProcess.stdout?.on("data", (data) => {});

            installProcess.stderr?.on("data", (data) => {});

            await new Promise<void>((resolve) => {
                installProcess.on("close", (code) => {
                    if (code === 0) {
                        console.log("Python 의존성 설치 완료");
                        this.dependenciesInstalled = true;
                    } else {
                        console.error(`Python 의존성 설치 실패 (코드: ${code})`);
                    }
                    this.isInstallingDependencies = false;
                    resolve();
                });
            });
        } catch (error) {
            console.error("Python 의존성 설치 실패:", error);
            this.isInstallingDependencies = false;
        }
    }

    /**
     * 요구사항 파일 경로 반환
     */
    private getRequirementsFilePath(): string {
        const isDev = process.env.NODE_ENV === "dev";
        const platform = process.platform;
        let fileName = "requirements.txt";

        // macOS용 별도 요구사항 파일 사용
        if (platform === "darwin") {
            fileName = "requirements-macos.txt";
        }

        if (isDev) {
            return path.join(process.cwd(), "python", fileName);
        } else {
            return path.join(process.resourcesPath, "python", fileName);
        }
    }

    /**
     * IPC 이벤트 리스너 설정
     */
    private setupIpcListeners(): void {
        // 날씨 정보 가져오기 (항상 FastAPI 사용)
        ipcMain.handle("python:get-weather", async () => {
            return this.getWeatherFromApi();
        });

        // FastAPI 서버 상태 확인
        ipcMain.handle("python:check-api-server", async () => {
            return this.checkApiServerStatus();
        });

        // 플랫폼 정보 가져오기
        ipcMain.handle("get-platform", () => {
            return process.platform;
        });
    }

    /**
     * Python 스크립트 경로 반환 (개발 환경과 프로덕션 환경 구분)
     */
    private getPythonScriptPath(scriptName: string): string {
        const isDev = process.env.NODE_ENV === "dev";
        if (isDev) {
            return path.join(process.cwd(), "python", scriptName);
        } else {
            // 배포 환경에서는 resources 폴더 내부에 Python 스크립트가 복사됨
            return path.join(process.resourcesPath, "python", scriptName);
        }
    }

    /**
     * Python 실행 파일 경로 확인
     */
    private getPythonExecutablePath(): string {
        const isDev = process.env.NODE_ENV === "dev";

        // 개발 환경: 가상환경 또는 시스템에 설치된 Python 사용
        if (isDev) {
            // 가상환경 Python 경로 확인
            const venvPythonPath = this.getVirtualEnvPythonPath();
            if (venvPythonPath) {
                return venvPythonPath;
            }

            // 가상환경이 없으면 시스템 Python 검색
            if (process.platform === "win32") {
                return "python"; // Windows
            } else {
                return "python3"; // macOS, Linux
            }
        }
        // 배포 환경: 시스템 Python 사용
        else {
            if (process.platform === "win32") {
                return "python";
            } else {
                // macOS, Linux에서는 python3 명령 사용
                return "python3";
            }
        }
    }

    /**
     * 가상환경의 Python 경로 찾기
     */
    private getVirtualEnvPythonPath(): string | null {
        try {
            // 프로젝트 루트 디렉토리 경로
            const projectRoot = process.cwd();

            // 가상환경 경로
            let venvPath: string;

            // OS에 따라 가상환경 내 Python 실행 파일 경로가 다름
            if (process.platform === "win32") {
                venvPath = path.join(projectRoot, "venv", "Scripts", "python.exe");
            } else {
                venvPath = path.join(projectRoot, "venv", "bin", "python");
            }

            // 가상환경 Python 존재 확인
            if (fs.existsSync(venvPath)) {
                console.log(`가상환경 Python 사용: ${venvPath}`);
                return venvPath;
            }

            return null;
        } catch (error) {
            console.warn("가상환경 Python 찾기 실패:", error);
            return null;
        }
    }

    /**
     * 포트가 사용 가능한지 확인
     */
    private async isPortAvailable(port: number): Promise<boolean> {
        try {
            await axios.get(`http://127.0.0.1:${port}/docs`, { timeout: 500 });
            // 연결이 성공하면 포트가 이미 사용 중
            return false;
        } catch (error: any) {
            // 연결 거부 오류는 포트가 사용 가능함을 의미
            if (error.code === "ECONNREFUSED") {
                return true;
            }
            // 다른 종류의 오류는 이미 서버가 실행 중일 수 있음
            return false;
        }
    }

    /**
     * 사용 가능한 포트 찾기
     */
    private async findAvailablePort(startPort: number, attempts: number): Promise<number> {
        for (let i = 0; i < attempts; i++) {
            const port = startPort + i;
            if (await this.isPortAvailable(port)) {
                return port;
            }
        }
        // 모든 시도가 실패하면 기본 포트 반환
        return startPort;
    }

    /**
     * 실행 중인 프로젝트 관련 Python 프로세스만 종료
     */
    private killPythonProcesses(): void {
        try {
            // PID 파일에서 프로세스 ID 읽기 시도
            const tempDir = process.platform === "win32" ? process.env.TEMP || "C:\\Temp" : "/tmp";
            const pidFilePath = path.join(tempDir, "weather_service_pid.txt");

            if (fs.existsSync(pidFilePath)) {
                try {
                    // PID 파일에서 프로세스 ID 읽기
                    const pid = parseInt(fs.readFileSync(pidFilePath, "utf8").trim());
                    console.log(`PID 파일에서 찾은 프로세스 ID: ${pid}`);

                    // 프로세스 종료 시도
                    if (process.platform === "win32") {
                        spawn("taskkill", ["/F", "/PID", pid.toString()]);
                    } else {
                        spawn("kill", ["-15", pid.toString()]);
                    }

                    // PID 파일 삭제
                    fs.unlinkSync(pidFilePath);
                    console.log(`PID 파일 삭제: ${pidFilePath}`);

                    return; // PID 파일로 종료 성공하면 여기서 종료
                } catch (err) {
                    console.error(`PID 파일을 사용한 프로세스 종료 실패:`, err);
                    // 실패한 경우 PID 파일 삭제 시도
                    try {
                        fs.unlinkSync(pidFilePath);
                    } catch (e) {}
                }
            }

            // PID 파일이 없거나 읽기 실패한 경우 스크립트 이름으로 프로세스 종료 시도
            if (process.platform === "win32") {
                // Windows에서는 특정 스크립트 이름으로 실행 중인 프로세스만 종료
                spawn("taskkill", ["/F", "/FI", "WINDOWTITLE eq weather_service.py*"]);
                // 또는 특정 명령줄 인자로 실행된 Python 프로세스만 종료
                spawn("wmic", [
                    "process",
                    "where",
                    "caption='python.exe' and commandline like '%weather_service.py%'",
                    "delete",
                ]);
            } else {
                // macOS, Linux에서는 특정 스크립트 이름으로 실행 중인 프로세스만 종료
                const killCmd = spawn("pkill", ["-f", "weather_service.py"]);

                killCmd.on("error", (err) => {
                    console.error("Python 프로세스 종료 실패:", err.message);
                });
            }
        } catch (error) {
            console.error("Python 프로세스 종료 중 오류:", error);
        }
    }

    /**
     * FastAPI 서버 시작
     */
    private async startFastApiServer(): Promise<any> {
        try {
            // 이미 실행 중인 경우 상태 반환
            if (this.isApiServerRunning && this.fastApiServer) {
                return {
                    type: "success",
                    data: {
                        message: "FastAPI 서버가 이미 실행 중입니다.",
                        status: "running",
                        url: this.apiBaseUrl,
                    },
                };
            }

            // 의존성 설치가 완료되지 않은 경우 설치 시도
            if (!this.dependenciesInstalled) {
                await this.installPythonDependencies();
            }

            // 이전 실행 중인 프로세스 정리 (포트가 이미 사용 중인 경우)
            this.killPythonProcesses();

            // 잠시 대기 (프로세스 종료를 위한 시간)
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 사용 가능한 포트 찾기
            this.apiPort = await this.findAvailablePort(8000, this.maxPortAttempts);
            this.apiBaseUrl = `http://127.0.0.1:${this.apiPort}`;

            const pythonExecutable = this.getPythonExecutablePath();
            const scriptPath = this.getPythonScriptPath("weather_service.py");

            // 스크립트 파일 존재 확인
            if (!fs.existsSync(scriptPath)) {
                throw new Error(`Python 스크립트를 찾을 수 없습니다: ${scriptPath}`);
            }

            // 서버 모드로 실행 (포트 지정)
            const args = [scriptPath, "--server", "--port", this.apiPort.toString()];

            // Python 환경 변수 설정
            const env = { ...process.env };

            console.log(`FastAPI 서버 시작: ${pythonExecutable} ${args.join(" ")}`);

            // Python 프로세스 실행
            this.fastApiServer = spawn(pythonExecutable, args, {
                env,
                detached: false, // 백그라운드에서 실행하지 않음
                stdio: ["ignore", "pipe", "pipe"],
            });

            // PID 저장
            if (this.fastApiServer.pid) {
                this.serverPid = this.fastApiServer.pid;
                console.log(`FastAPI 서버 PID: ${this.serverPid}`);
            }

            // 서버 출력 처리
            this.fastApiServer.stdout?.on("data", (data) => {
                console.log("FastAPI 서버 출력:", data.toString());
            });

            // 서버 에러 처리
            this.fastApiServer.stderr?.on("data", (data) => {
                console.error("FastAPI 서버 에러:", data.toString());
            });

            // 프로세스 종료 처리
            this.fastApiServer.on("close", (code) => {
                console.log(`FastAPI 서버가 종료되었습니다 (코드: ${code})`);
                this.isApiServerRunning = false;
                this.fastApiServer = null;
                this.serverPid = null;

                // 서버가 비정상 종료된 경우 재시작 시도
                if (code !== 0) {
                    console.log("FastAPI 서버 재시작 시도...");
                    setTimeout(() => this.startFastApiServer(), 3000);
                }
            });

            // 프로세스 에러 처리
            this.fastApiServer.on("error", (err) => {
                console.error(`FastAPI 서버 실행 오류: ${err.message}`);
                this.isApiServerRunning = false;
                this.fastApiServer = null;
                this.serverPid = null;
            });

            // 서버가 실행될 때까지 대기
            await this.waitForServer();
            this.isApiServerRunning = true;

            return {
                type: "success",
                data: {
                    message: "FastAPI 서버가 시작되었습니다.",
                    status: "running",
                    url: this.apiBaseUrl,
                },
            };
        } catch (error: any) {
            console.error(`FastAPI 서버 시작 실패: ${error.message}`);
            return {
                type: "error",
                data: {
                    message: `FastAPI 서버 시작 실패: ${error.message}`,
                },
            };
        }
    }

    /**
     * FastAPI 서버 중지
     */
    private stopFastApiServer(): any {
        try {
            console.log("FastAPI 서버 중지 시도...");

            if (this.fastApiServer) {
                // 서버 프로세스 종료
                if (process.platform === "win32") {
                    this.fastApiServer.kill("SIGTERM");
                } else {
                    this.fastApiServer.kill("SIGTERM");
                }

                console.log("FastAPI 서버 프로세스 종료 신호 전송 완료");
            }

            // PID로 추가 종료 시도
            if (this.serverPid) {
                try {
                    process.kill(this.serverPid, "SIGTERM");
                    console.log(`PID ${this.serverPid}에 종료 신호 전송 완료`);
                } catch (e) {
                    console.log(`PID ${this.serverPid} 종료 실패:`, e);
                }
            }

            // 모든 Python 프로세스 정리 (추가 안전장치)
            this.killPythonProcesses();

            this.isApiServerRunning = false;
            this.fastApiServer = null;
            this.serverPid = null;

            return {
                type: "success",
                data: {
                    message: "FastAPI 서버가 중지되었습니다.",
                    status: "stopped",
                },
            };
        } catch (error: any) {
            console.error(`FastAPI 서버 중지 실패: ${error.message}`);

            // 실패해도 모든 Python 프로세스 정리 시도
            this.killPythonProcesses();

            return {
                type: "error",
                data: {
                    message: `FastAPI 서버 중지 실패: ${error.message}`,
                },
            };
        }
    }

    /**
     * FastAPI 서버 상태 확인
     */
    private async checkApiServerStatus(): Promise<any> {
        try {
            await axios.get(`${this.apiBaseUrl}/docs`);
            this.isApiServerRunning = true;
            return {
                type: "success",
                data: {
                    status: "running",
                    url: this.apiBaseUrl,
                },
            };
        } catch (error) {
            this.isApiServerRunning = false;

            // 서버가 실행 중이 아니면 자동으로 시작
            this.startFastApiServer();

            return {
                type: "success",
                data: {
                    status: "starting",
                    message: "서버가 실행 중이 아닙니다. 서버를 시작합니다.",
                },
            };
        }
    }

    /**
     * FastAPI 서버가 실행될 때까지 대기
     */
    private async waitForServer(retries = 10, delay = 500): Promise<boolean> {
        for (let i = 0; i < retries; i++) {
            try {
                await axios.get(`${this.apiBaseUrl}/docs`);
                return true;
            } catch (error) {
                // 지정된 시간만큼 대기
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error("FastAPI 서버 시작 시간 초과");
    }

    /**
     * FastAPI를 통해 날씨 정보 가져오기
     */
    public async getWeatherFromApi(): Promise<any> {
        try {
            // 서버가 실행 중인지 확인
            if (!this.isApiServerRunning) {
                // 서버가 실행 중이 아니면 시작
                await this.startFastApiServer();

                // 서버가 완전히 준비될 때까지 잠시 대기
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // API 엔드포인트 호출
            const response = await axios.get(`${this.apiBaseUrl}/weather/current`);
            return response.data;
        } catch (error: any) {
            return {
                type: "error",
                data: {
                    message: `날씨 API 호출 실패: ${error.message}`,
                },
            };
        }
    }

    /**
     * 서비스 종료 및 리소스 정리
     */
    public dispose(): void {
        console.log("PythonWeatherService 리소스 정리 중...");

        // Python 프로세스 종료
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }

        // FastAPI 서버 종료
        this.stopFastApiServer();
    }
}
