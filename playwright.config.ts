import { defineConfig, devices } from '@playwright/test';

function getKstRunId(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}-${partMap.minute}-${partMap.second}-KST`;
}

const scenarioRunId = process.env.PW_SCENARIO_RUN_ID ?? getKstRunId();
process.env.PW_SCENARIO_RUN_ID = scenarioRunId;

export default defineConfig({
  // 테스트 파일 위치
  testDir: './tests',

  // 전체 테스트 타임아웃 (ms)
  timeout: 30_000,

  // expect() 타임아웃
  expect: {
    timeout: 5_000,
  },

  // 실패 시 재시도 횟수 (CI 환경에서는 2로 설정 권장)
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'summary.json' }],
  ],

  // 전체 테스트에 적용되는 공통 설정
  use: {
    // 테스트 대상 URL (환경에 맞게 변경)
    baseURL: 'https://www.saucedemo.com/',

    // 실패 시 스크린샷 자동 캡처
    screenshot: 'only-on-failure',

    // 실패 시 비디오 녹화
    video: 'retain-on-failure',

    // 실패 시 trace 저장
    trace: 'on-first-retry',

    // 헤드리스 모드 (false로 바꾸면 브라우저 화면 표시)
    headless: true,
  },

  // 테스트할 브라우저/디바이스 목록
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    //{
    //  name: 'firefox',
    //  use: { ...devices['Desktop Firefox'] },
    //},
    //{
    //  name: 'webkit',
    //  use: { ...devices['Desktop Safari'] },
    //},
    // 모바일 테스트가 필요한 경우 아래 주석 해제
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});