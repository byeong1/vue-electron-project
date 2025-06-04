const fs = require("fs");
const path = require("path");

// dist/electron 디렉토리 생성
const targetDir = path.join(__dirname, "dist", "electron");
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
}

// preload.js 파일 복사
const sourceFile = path.join(__dirname, "electron", "preload.js");
const targetFile = path.join(targetDir, "preload.js");

fs.copyFileSync(sourceFile, targetFile);
console.log(`Copied ${sourceFile} to ${targetFile}`);
