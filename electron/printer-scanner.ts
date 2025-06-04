// /**
//  * 프린터 연결 및 기본 정보 확인 스크립트
//  */

// // IPP 라이브러리 동적 로딩
// let IPP: any = null;

// try {
//     IPP = require("ipp");
//     console.log("✅ IPP 라이브러리 로드 성공");
// } catch (error) {
//     console.log("❌ IPP 라이브러리 없음");
// }

// interface PrinterTestResult {
//     ip: string;
//     port: number;
//     ippAvailable: boolean;
//     rawAvailable: boolean;
//     supportedFormats?: string[];
//     printerInfo?: any;
//     error?: string;
// }

// async function testPrinterConnection(ip: string): Promise<PrinterTestResult> {
//     const result: PrinterTestResult = {
//         ip,
//         port: 631,
//         ippAvailable: false,
//         rawAvailable: false,
//     };

//     console.log(`\n=== ${ip} 프린터 연결 테스트 ===`);

//     // 1. Raw 포트 (9100) 테스트
//     result.rawAvailable = await testPort(ip, 9100);
//     console.log(`Raw 포트 (9100): ${result.rawAvailable ? "✅ 사용 가능" : "❌ 사용 불가"}`);

//     // 2. IPP 포트 (631) 테스트
//     const ippPortOpen = await testPort(ip, 631);
//     console.log(`IPP 포트 (631): ${ippPortOpen ? "✅ 열림" : "❌ 닫힘"}`);

//     if (ippPortOpen && IPP) {
//         // 3. IPP 프로토콜 테스트
//         try {
//             const printerInfo = await getIPPPrinterInfo(ip);
//             if (printerInfo) {
//                 result.ippAvailable = true;
//                 result.printerInfo = printerInfo;
//                 result.supportedFormats = printerInfo.supportedFormats;

//                 console.log("✅ IPP 프로토콜 사용 가능");
//                 console.log("프린터 정보:");
//                 console.log(`  모델: ${printerInfo.model || "알 수 없음"}`);
//                 console.log(`  상태: ${printerInfo.state || "알 수 없음"}`);
//                 console.log(
//                     `  지원 형식: ${printerInfo.supportedFormats?.join(", ") || "확인 불가"}`,
//                 );
//             }
//         } catch (error: any) {
//             result.error = `IPP 테스트 실패: ${error.message}`;
//             console.log(`❌ IPP 프로토콜 오류: ${error.message}`);
//         }
//     }

//     return result;
// }

// function testPort(host: string, port: number): Promise<boolean> {
//     return new Promise((resolve) => {
//         const net = require("net");
//         const socket = new net.Socket();

//         socket.setTimeout(3000);

//         socket.on("connect", () => {
//             socket.destroy();
//             resolve(true);
//         });

//         socket.on("timeout", () => {
//             socket.destroy();
//             resolve(false);
//         });

//         socket.on("error", () => {
//             resolve(false);
//         });

//         socket.connect(port, host);
//     });
// }

// function getIPPPrinterInfo(ip: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//         if (!IPP) {
//             reject(new Error("IPP 라이브러리 없음"));
//             return;
//         }

//         const uri = `ipp://${ip}:631/ipp/print`;
//         const printer = new IPP.Printer(uri);

//         const message = {
//             "operation-attributes-tag": {
//                 "requested-attributes": [
//                     "printer-name",
//                     "printer-make-and-model",
//                     "printer-state",
//                     "printer-state-message",
//                     "document-format-supported",
//                     "media-supported",
//                     "sides-supported",
//                     "print-color-mode-supported",
//                 ],
//             },
//         };

//         printer.execute("Get-Printer-Attributes", message, (err: any, res: any) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             const attrs = res["printer-attributes-tag"];
//             if (!attrs) {
//                 reject(new Error("프린터 속성을 가져올 수 없음"));
//                 return;
//             }

//             const info = {
//                 name: attrs["printer-name"],
//                 model: attrs["printer-make-and-model"],
//                 state: attrs["printer-state"],
//                 stateMessage: attrs["printer-state-message"],
//                 supportedFormats: Array.isArray(attrs["document-format-supported"])
//                     ? attrs["document-format-supported"]
//                     : [attrs["document-format-supported"]],
//                 supportedMedia: attrs["media-supported"],
//                 sidesSupported: attrs["sides-supported"],
//                 colorSupported: attrs["print-color-mode-supported"],
//             };

//             resolve(info);
//         });
//     });
// }

// async function testSimplePrint(ip: string, useRaw: boolean = false): Promise<boolean> {
//     if (useRaw) {
//         return testRawPrint(ip);
//     } else {
//         return testIPPPrint(ip);
//     }
// }

// async function testRawPrint(ip: string): Promise<boolean> {
//     console.log(`\n📄 Raw 인쇄 테스트 (${ip}:9100)`);

//     const net = require("net");

//     return new Promise((resolve) => {
//         const socket = new net.Socket();

//         const testData = `
// 테스트 페이지 - Raw 인쇄
// ========================

// 시간: ${new Date().toLocaleString()}
// IP: ${ip}
// 방법: Raw Socket (포트 9100)

// 이 페이지가 출력되면 Raw 인쇄가
// 정상적으로 작동하는 것입니다.

// ========================
// \f`;

//         socket.setTimeout(10000);

//         socket.connect(9100, ip, () => {
//             console.log("Raw 소켓 연결 성공, 데이터 전송...");
//             socket.write(testData, "utf-8");

//             setTimeout(() => {
//                 socket.end();
//             }, 2000);
//         });

//         socket.on("close", () => {
//             console.log("✅ Raw 인쇄 테스트 완료");
//             resolve(true);
//         });

//         socket.on("error", (err: any) => {
//             console.log(`❌ Raw 인쇄 실패: ${err.message}`);
//             resolve(false);
//         });

//         socket.on("timeout", () => {
//             console.log("⏰ Raw 인쇄 타임아웃");
//             socket.destroy();
//             resolve(false);
//         });
//     });
// }

// async function testIPPPrint(ip: string): Promise<boolean> {
//     console.log(`\n📄 IPP 인쇄 테스트 (${ip}:631)`);

//     if (!IPP) {
//         console.log("❌ IPP 라이브러리가 없어 테스트할 수 없습니다.");
//         return false;
//     }

//     return new Promise((resolve) => {
//         const uri = `ipp://${ip}:631/ipp/print`;
//         const printer = new IPP.Printer(uri);

//         const testData = `
// 테스트 페이지 - IPP 인쇄
// =======================

// 시간: ${new Date().toLocaleString()}
// IP: ${ip}
// 방법: IPP 프로토콜 (포트 631)

// 이 페이지가 출력되면 IPP 인쇄가
// 정상적으로 작동하는 것입니다.

// =======================
// `;

//         const message = {
//             "operation-attributes-tag": {
//                 "requesting-user-name": "TestUser",
//                 "job-name": "Connection Test",
//                 "document-format": "text/plain",
//                 copies: 1,
//             },
//             data: Buffer.from(testData, "utf-8"),
//         };

//         printer.execute("Print-Job", message, (err: any, res: any) => {
//             if (err) {
//                 console.log(`❌ IPP 인쇄 실패: ${err.message}`);
//                 resolve(false);
//                 return;
//             }

//             console.log("IPP 응답:", res.statusCode);

//             if (res.statusCode && res.statusCode.startsWith("successful")) {
//                 console.log("✅ IPP 인쇄 테스트 성공");
//                 const jobId = res["job-attributes-tag"]?.["job-id"];
//                 if (jobId) {
//                     console.log(`작업 ID: ${jobId}`);
//                 }
//             } else {
//                 console.log(`❌ IPP 인쇄 실패: ${res.statusCode}`);
//                 resolve(false);
//             }
//         });
//     });
// }

// // 메인 실행 함수
// async function main() {
//     console.log("=== 프린터 연결 테스트 시작 ===");

//     // 테스트할 일반적인 프린터 IP들
//     const testIPs = [
//         "192.168.1.100",
//         "192.168.1.101",
//         "192.168.1.102",
//         "192.168.0.100",
//         "192.168.0.101",
//         "10.0.0.100",
//     ];

//     const foundPrinters: PrinterTestResult[] = [];

//     // 각 IP에 대해 연결 테스트
//     for (const ip of testIPs) {
//         const result = await testPrinterConnection(ip);

//         if (result.ippAvailable || result.rawAvailable) {
//             foundPrinters.push(result);
//         }
//     }

//     console.log("\n=== 테스트 결과 요약 ===");

//     if (foundPrinters.length === 0) {
//         console.log("❌ 응답하는 프린터를 찾을 수 없습니다.");
//         console.log("\n다음을 확인해보세요:");
//         console.log("1. 프린터가 켜져 있고 네트워크에 연결되어 있는지");
//         console.log("2. 컴퓨터와 프린터가 같은 네트워크에 있는지");
//         console.log("3. 프린터 IP 주소가 위의 범위에 있는지");
//         console.log("4. 프린터에서 네트워크 인쇄가 활성화되어 있는지");
//         return;
//     }

//     console.log(`✅ ${foundPrinters.length}개의 프린터를 발견했습니다:`);

//     foundPrinters.forEach((printer, index) => {
//         console.log(`\n${index + 1}. ${printer.ip}`);
//         console.log(`   IPP 지원: ${printer.ippAvailable ? "✅" : "❌"}`);
//         console.log(`   Raw 지원: ${printer.rawAvailable ? "✅" : "❌"}`);

//         if (printer.printerInfo) {
//             console.log(`   모델: ${printer.printerInfo.model || "알 수 없음"}`);
//             if (printer.supportedFormats?.length) {
//                 console.log(
//                     `   지원 형식: ${printer.supportedFormats.slice(0, 3).join(", ")}${printer.supportedFormats.length > 3 ? "..." : ""}`,
//                 );
//             }
//         }
//     });

//     // 첫 번째 프린터로 실제 인쇄 테스트
//     if (foundPrinters.length > 0) {
//         const firstPrinter = foundPrinters[0];
//         console.log(`\n=== ${firstPrinter.ip}로 인쇄 테스트 ===`);

//         if (firstPrinter.ippAvailable) {
//             console.log("IPP 인쇄 테스트 중...");
//             await testIPPPrint(firstPrinter.ip);
//         } else if (firstPrinter.rawAvailable) {
//             console.log("Raw 인쇄 테스트 중...");
//             await testRawPrint(firstPrinter.ip);
//         }
//     }

//     console.log("\n=== 테스트 완료 ===");
// }

// // 직접 실행
// if (require.main === module) {
//     main().catch(console.error);
// }

// export { testPrinterConnection, testSimplePrint };
