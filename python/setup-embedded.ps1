# Python 임베디드 패키지 다운로드 및 설정 스크립트
# 임베디드 버전을 다운로드하고 필요한 패키지를 설치합니다.

$ErrorActionPreference = "Stop"

# 설정 변수
$pythonVersion = "3.11.4"
$pythonDir = "python-embedded"
$pythonZip = "python-embedded.zip"
$downloadUrl = "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-embed-amd64.zip"
$getpipUrl = "https://bootstrap.pypa.io/get-pip.py"

# 스크립트 경로 설정
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$workingDir = Join-Path -Path $scriptPath -ChildPath ".."
$targetDir = Join-Path -Path $workingDir -ChildPath $pythonDir
$zipPath = Join-Path -Path $workingDir -ChildPath $pythonZip

# 이미 설치되어 있는지 확인
if (Test-Path $targetDir) {
    Write-Host "임베디드 파이썬이 이미 설치되어 있습니다: $targetDir"
    Write-Host "기존 설치를 제거하려면 폴더를 삭제한 후 다시 실행하세요."
    exit 0
}

# 작업 디렉토리 생성
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Write-Host "파이썬 임베디드 버전 $pythonVersion 다운로드 중..."

# 파이썬 임베디드 패키지 다운로드
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
Write-Host "다운로드 완료."

# 압축 해제
Write-Host "압축 해제 중..."
Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
Remove-Item -Path $zipPath -Force
Write-Host "압축 해제 완료."

# pip 설치
Write-Host "pip 설치 중..."
$getpipPath = Join-Path -Path $targetDir -ChildPath "get-pip.py"
Invoke-WebRequest -Uri $getpipUrl -OutFile $getpipPath

# python**._pth 파일 수정 (import site 활성화)
$pthFiles = Get-ChildItem -Path $targetDir -Filter "python*._pth"
foreach ($pthFile in $pthFiles) {
    $content = Get-Content -Path $pthFile.FullName
    $newContent = $content | ForEach-Object {
        if ($_ -eq "#import site") {
            "import site"
        } else {
            $_
        }
    }
    Set-Content -Path $pthFile.FullName -Value $newContent
}

# pip 실행
$pythonExe = Join-Path -Path $targetDir -ChildPath "python.exe"
& $pythonExe $getpipPath --no-warn-script-location
Remove-Item -Path $getpipPath -Force
Write-Host "pip 설치 완료."

# 필요한 패키지 설치
Write-Host "필수 패키지 설치 중..."
$reqFile = Join-Path -Path $scriptPath -ChildPath "requirements.txt"
if (Test-Path $reqFile) {
    & $pythonExe -m pip install -r $reqFile --no-warn-script-location
    Write-Host "패키지 설치 완료."
} else {
    Write-Host "requirements.txt 파일을 찾을 수 없습니다. 패키지 설치를 건너뜁니다."
}

Write-Host "임베디드 파이썬 설정이 완료되었습니다."
Write-Host "경로: $targetDir" 