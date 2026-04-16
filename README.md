# Sauce Demo E2E 테스트 프로젝트

## 프로젝트 개요

이 프로젝트는 [Sauce Demo](https://www.saucedemo.com/) 사이트의 End-to-End 자동화 테스트를 위한 Playwright 기반 테스트 스위트입니다.

**주요 기능 테스트:**
- 사용자 로그인 (다양한 계정 타입: standard, locked_out, problem, performance, error, visual)
- 상품 인벤토리 탐색 및 정렬 (이름, 가격 오름차순/내림차순)
- 장바구니 관리 (추가/제거, 복수 상품)
- 결제 프로세스 (정보 입력, 완료)
- 로그아웃

**기술 스택:**
- Playwright v1.44.0
- TypeScript
- Page Object Model 패턴
- 커스텀 Fixtures
- 환경 변수 관리 (.env)

## 초기 설치 및 설정

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정하세요:
```env
# Sauce Demo 계정 정보
STANDARD_USER=standard_user
LOCKED_USER=locked_out_user
PROBLEM_USER=problem_user
PERFORMANCE_USER=performance_glitch_user
ERROR_USER=error_user
VISUAL_USER=visual_user
SAUCE_PW=secret_sauce
```

### 3. Playwright 브라우저 설치
```bash
npx playwright install
```

## 테스트 실행 명령어

| 명령어 | 설명 |
|---|---|
| `npm test` | 모든 테스트 실행 (헤드리스 모드) |
| `npm run test:headed` | 브라우저 화면 표시하며 실행 |
| `npm run test:smoke` | @smoke 태그 테스트만 실행 (핵심 기능) |
| `npm run test:regression` | @regression 태그 테스트만 실행 (전체 기능) |
| `npm run test:negative` | @negative 태그 테스트만 실행 (에러 케이스) |
| `npm run test:chromium` | Chromium 브라우저만 사용 |
| `npm run test:firefox` | Firefox 브라우저만 사용 |
| `npm run test:webkit` | WebKit 브라우저만 사용 |
| `npm run report` | HTML 리포트 열기 |
| `npm run codegen` | 브라우저 조작 → 코드 자동 생성 |

### 추가 옵션
- `--grep "키워드"`: 특정 키워드 포함 테스트만 실행
- `--workers 1`: 직렬 실행 (디버깅용)
- `--headed`: 브라우저 화면 표시
- `--debug`: 스텝별 디버깅 모드

## 프로젝트 구조

```
포트폴리오/
├── playwright.config.ts     # 전체 설정 (브라우저, 타임아웃, 리포터 등)
├── tests/
│   ├── login.spec.ts        # 로그인 테스트 (성공/실패 케이스)
│   ├── inventory.spec.ts    # 인벤토리 테스트 (정렬, 상세, 품질 검증)
│   ├── cart.spec.ts         # 장바구니 테스트 (추가/제거, 상태 유지)
│   ├── checkout.spec.ts     # 결제 테스트 (정보 입력, 완료, 취소)
│   └── logout.spec.ts       # 로그아웃 테스트
├── pages/
│   ├── LoginPage.ts         # 로그인 페이지 Page Object
│   ├── InventoryPage.ts     # 인벤토리 페이지 Page Object
│   ├── CartPage.ts          # 장바구니 페이지 Page Object
│   └── CheckoutPage.ts      # 결제 페이지 Page Object
├── fixtures/
│   └── auth.fixture.ts      # 인증 관련 커스텀 Fixture
├── utils/
│   ├── env.ts               # 환경 변수 관리
│   ├── testData.ts          # 테스트 데이터 상수
│   ├── sortAssert.ts        # 정렬 검증 유틸
│   └── scenarioReport.ts    # 시나리오 리포트 유틸
├── playwright-report/       # HTML 리포트 (자동 생성)
├── test-results/            # 실패 스크린샷/비디오 (자동 생성)
├── summary.json             # 실행 요약 JSON (pass/fail 카운트, 실패 목록)
└── .env                     # 환경 변수 파일 (직접 생성 필요)
```

## 테스트 태그 설명

- `@smoke`: 핵심 기능 검증 (로그인 → 인벤토리 → 장바구니 → 결제 완료)
- `@regression`: 전체 기능 검증 (모든 정상/비정상 케이스)
- `@negative`: 에러 케이스 검증 (잘못된 입력, 권한 부족 등)

## 실행 결과

### HTML 리포트
실행 후 `npm run report`로 상세 리포트를 확인할 수 있습니다.

### JSON 요약 (summary.json)
실행 종료 시 자동 생성되는 JSON 파일로, 다음 정보를 포함합니다:
- 총 테스트 수
- 통과/실패 카운트
- 실패한 테스트 목록 (테스트명, 에러 메시지)

### 실패 로그 강화
실패 시 자동으로 다음이 생성됩니다:
- 스크린샷: `test-results/` 폴더
- 비디오: `test-results/` 폴더
- 트레이스: `test-results/` 폴더 (첫 번째 재시도 시)
- 콘솔 로그: 터미널 출력 (실패 원인 상세 설명)

## 코드 자동 생성 (Codegen)

브라우저를 직접 조작하며 테스트 코드를 생성할 수 있습니다:
```bash
npx playwright codegen https://www.saucedemo.com/
```

## CI/CD 통합

GitHub Actions 등 CI 환경에서 사용할 수 있습니다. 환경 변수는 GitHub Secrets로 설정하세요.

## 문제 해결

### 환경 변수 에러
`.env` 파일이 없거나 변수가 설정되지 않은 경우:
```
[ENV ERROR] SAUCE_PW가 설정되지 않았습니다.
```
`.env` 파일을 생성하고 변수를 설정하세요.

### 브라우저 설치 실패
```bash
npx playwright install --with-deps
```

### 테스트 타임아웃
`playwright.config.ts`의 `timeout` 값을 늘리세요 (기본 30초).

