// import { PrinterScanner, PrinterInfo } from "./printer-scanner";

// // IPP 라이브러리 동적 로딩
// let IPP: any = null;

// try {
//     IPP = require("ipp");
// } catch (error) {
//     console.warn("ipp 패키지를 찾을 수 없습니다. IPP 기능이 제한됩니다.");
// }

// export class PrinterTester {
//     private scanner: PrinterScanner;

//     constructor() {
//         this.scanner = new PrinterScanner();
//     }

//     /**
//      * 프린터 검색 및 테스트
//      */
//     async findAndTestPrinters(): Promise<PrinterInfo[]> {
//         console.log("=== 프린터 검색 및 테스트 시작 ===");

//         try {
//             // 1단계: 프린터 검색
//             const printers = await this.scanner.scanAllMethods();

//             if (printers.length === 0) {
//                 console.log("❌ 프린터를 찾을 수 없습니다.");
//                 return [];
//             }

//             console.log(`✅ ${printers.length}개의 프린터를 발견했습니다:`);

//             // 2단계: 각 프린터 정보 출력 및 테스트
//             for (let i = 0; i < printers.length; i++) {
//                 const printer = printers[i];
//                 console.log(`\n--- 프린터 ${i + 1} ---`);
//                 console.log(`이름: ${printer.name || "알 수 없음"}`);
//                 console.log(`IP: ${printer.ip || printer.host || "알 수 없음"}`);
//                 console.log(`포트: ${printer.port}`);
//                 console.log(`타입: ${printer.type}`);
//                 console.log(`URI: ${printer.uri || "없음"}`);

//                 // IPP 프린터인 경우 상세 정보 확인
//                 if (printer.type === "IPP" || printer.type === "Bonjour") {
//                     await this.testIPPPrinter(printer);
//                 }
//             }

//             return printers;
//         } catch (error) {
//             console.error("❌ 프린터 검색 중 오류 발생:", error);
//             return [];
//         }
//     }

//     /**
//      * IPP 프린터 상세 정보 및 연결 테스트
//      */
//     private async testIPPPrinter(printer: PrinterInfo): Promise<void> {
//         if (!printer.uri && !printer.ip) {
//             console.log("   ⚠️  URI 또는 IP 정보가 없어 테스트를 건너뜁니다.");
//             return;
//         }

//         if (!IPP) {
//             console.log("   ⚠️  IPP 라이브러리가 없어 테스트를 건너뜁니다.");
//             return;
//         }

//         try {
//             const uri = printer.uri || `ipp://${printer.ip}:${printer.port}/ipp/print`;
//             console.log(`   🔍 IPP 연결 테스트: ${uri}`);

//             // 기본 HTTP 요청으로 프린터 응답 확인
//             const http = require("http");
//             const url = require("url");

//             const parsedUrl = url.parse(uri);

//             const options = {
//                 hostname: parsedUrl.hostname,
//                 port: parsedUrl.port || 631,
//                 path: parsedUrl.path || "/ipp/print",
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/ipp",
//                     "User-Agent": "Electron-Printer-Scanner",
//                 },
//                 timeout: 5000,
//             };

//             const testConnection = new Promise<boolean>((resolve) => {
//                 const req = http.request(options, (res: any) => {
//                     console.log(`   ✅ HTTP 응답 코드: ${res.statusCode}`);
//                     resolve(res.statusCode < 500); // 400-499는 IPP 오류지만 연결은 됨
//                 });

//                 req.on("error", (error: any) => {
//                     console.log(`   ❌ 연결 실패: ${error.message}`);
//                     resolve(false);
//                 });

//                 req.on("timeout", () => {
//                     console.log("   ⏰ 연결 시간 초과");
//                     req.destroy();
//                     resolve(false);
//                 });

//                 req.end();
//             });

//             const connected = await testConnection;

//             if (connected) {
//                 console.log("   ✅ 프린터 연결 가능!");
//                 console.log(`   📄 프린터 URI: ${uri}`);
//             } else {
//                 console.log("   ❌ 프린터 연결 불가");
//             }
//         } catch (error) {
//             console.log(`   ❌ IPP 테스트 실패: ${error}`);
//         }
//     }

//     /**
//      * 프린터 상태 코드를 설명으로 변환
//      */
//     private getStateDescription(state: number): string {
//         const states: { [key: number]: string } = {
//             3: "유휴 상태 (Idle)",
//             4: "인쇄 중 (Processing)",
//             5: "정지됨 (Stopped)",
//         };

//         return states[state] || `알 수 없는 상태 (${state})`;
//     }

//     /**
//      * 특정 프린터로 테스트 페이지 인쇄
//      */
//     async printTestPage(
//         printer: PrinterInfo,
//         testText: string = "Electron 프린터 테스트 페이지",
//     ): Promise<boolean> {
//         if (!printer.uri && !printer.ip) {
//             console.error("프린터 URI 또는 IP가 없습니다.");
//             return false;
//         }

//         if (!IPP) {
//             console.error("IPP 라이브러리가 없어 인쇄할 수 없습니다.");
//             return false;
//         }

//         try {
//             const uri = printer.uri || `ipp://${printer.ip}:${printer.port}/ipp/print`;
//             console.log(`🖨️  테스트 페이지 인쇄 시도: ${uri}`);

//             // 간단한 Raw 데이터 전송 시도
//             const net = require("net");

//             if (printer.type === "Raw" && printer.port === 9100) {
//                 // Raw 포트로 직접 전송
//                 return await this.printRawData(printer.ip!, testText);
//             } else {
//                 // IPP 프로토콜 시도
//                 return await this.printViaIPP(uri, testText);
//             }
//         } catch (error) {
//             console.error("❌ 테스트 페이지 인쇄 실패:", error);
//             return false;
//         }
//     }

//     /**
//      * Raw 포트로 직접 인쇄
//      */
//     private async printRawData(ip: string, text: string): Promise<boolean> {
//         return new Promise((resolve) => {
//             const net = require("net");
//             const socket = new net.Socket();

//             socket.connect(9100, ip, () => {
//                 console.log("Raw 프린터 연결 성공");

//                 // 간단한 텍스트 + 폼피드
//                 const printData = text + "\n\n인쇄 시간: " + new Date().toLocaleString() + "\f";
//                 socket.write(printData);
//                 socket.end();
//             });

//             socket.on("close", () => {
//                 console.log("✅ Raw 인쇄 완료");
//                 resolve(true);
//             });

//             socket.on("error", (error) => {
//                 console.error("❌ Raw 인쇄 실패:", error);
//                 resolve(false);
//             });

//             setTimeout(() => {
//                 socket.destroy();
//                 resolve(false);
//             }, 10000);
//         });
//     }

//     /**
//      * IPP로 인쇄 시도
//      */
//     private async printViaIPP(uri: string, text: string): Promise<boolean> {
//         try {
//             // 기본적인 HTTP POST 요청으로 시도
//             console.log("IPP 인쇄 기능은 현재 제한적입니다.");
//             console.log("프린터 웹 인터페이스나 시스템 프린터를 사용하세요.");
//             return false;
//         } catch (error) {
//             console.error("IPP 인쇄 실패:", error);
//             return false;
//         }
//     }

//     /**
//      * 리소스 정리
//      */
//     dispose(): void {
//         this.scanner.dispose();
//     }
// }

// // 직접 실행용 (테스트)
// if (require.main === module) {
//     const tester = new PrinterTester();

//     tester
//         .findAndTestPrinters()
//         .then((printers) => {
//             console.log("\n=== 검색 완료 ===");
//             console.log(`총 ${printers.length}개의 프린터를 발견했습니다.`);

//             // 첫 번째 IPP 프린터로 테스트 페이지 인쇄 시도
//             const ippPrinter = printers.find((p) => p.type === "IPP" || p.type === "Bonjour");
//             if (ippPrinter) {
//                 console.log("\n=== 테스트 페이지 인쇄 ===");
//                 return tester.printTestPage(ippPrinter);
//             }
//         })
//         .catch((error) => {
//             console.error("테스트 실행 오류:", error);
//         })
//         .finally(() => {
//             tester.dispose();
//         });
// }
