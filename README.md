# Vue + Electron 프로젝트

이 프로젝트는 **Vue 3 + Vite** 기반의 프론트엔드와 **Electron**을 통한 데스크탑 앱, 그리고 Nest.js 백엔드와의 연동을 포함합니다.

## 프로젝트 구조

- **src/**: Vue 3 프론트엔드 소스
- **electron/**: Electron 메인 프로세스 코드
- **dist/**: 빌드 결과물
- **package.json**: 프로젝트 메타 및 스크립트

## 개발 환경 준비

1. **의존성 설치**

    ```sh
    yarn
    ```

2. **환경 변수 파일 생성**

    프로젝트 루트에 `.env` 파일을 생성하고 아래와 같이 작성하세요.

    ```env
    VITE_PORT=5173

    ELECTRON_PORT=5173

    VITE_BACK_END_SERVER=http://127.0.0.1:3000

    GH_TOKEN=your_github_token_here
    ```

    - `VITE_PORT`: Vite 개발 서버가 실행될 포트 번호.
    - `ELECTRON_PORT`: Electron 서버가 실행될 포트 번호.
    - `VITE_BACK_END_SERVER`: API 서버 주소를 입력하세요.
    - `GH_TOKEN`: Electron 앱을 GitHub Releases로 자동 배포할 때 사용하는 GitHub Personal Access Token.

## 주요 명령어 및 용도

| 명령어                      | 설명                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `yarn dev`                  | Vite 개발 서버 실행 (웹에서 Vue 앱 개발/테스트)                                      |
| `yarn build`                | 프론트엔드(Vite) 빌드                                                                |
| `yarn preview`              | 빌드 결과물 로컬 서버에서 미리보기                                                   |
| `yarn electron:dev`         | **Electron + Vite 개발 서버 동시 실행**<br>Electron 환경에서 데스크탑 앱 개발/테스트 |
| `yarn electron:build:mac`   | macOS용 Electron 앱 빌드                                                             |
| `yarn electron:build:win`   | Windows용 Electron 앱 빌드                                                           |
| `yarn electron:build:linux` | Linux용 Electron 앱 빌드                                                             |
| `yarn type-check`           | 타입스크립트 타입 검사                                                               |
| `yarn format`               | Prettier로 코드 포맷팅                                                               |

## 실행 예시

### 1. 웹 개발 서버 실행 (브라우저에서 Vue 앱 확인)

```sh
yarn dev
```

### 2. Electron 데스크탑 앱 개발 모드 실행

```sh
yarn electron:dev
```

- Vite 개발 서버와 Electron이 동시에 실행됩니다.

### 3. 프로덕션 빌드 및 배포용 앱 생성

```sh
# macOS
yarn electron:build:mac

# Windows
yarn electron:build:win

# Linux
yarn electron:build:linux
```

---

## 기타 참고

- `.env` 파일은 git에 커밋되지 않으니, 각 개발 환경에서 직접 생성해야 합니다.

---

**문의/기여**  
이 프로젝트에 대한 문의나 기여는 언제든 환영합니다!
