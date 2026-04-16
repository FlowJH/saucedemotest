import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ENV } from '../utils/env';
import { saveScenarioReport } from '../utils/scenarioReport';

// 공통 Fixture
// - login: 어떤 테스트에서도 동일한 로그인 절차를 재사용
// - afterEach: 모든 시나리오의 스크린샷/로그를 자동 수집
export const test = base.extend<{
  login: (username: string) => Promise<void>;
}>({
  login: async ({ page }, use) => {
    await use(async (username: string) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(username, ENV.PASSWORD);
    });
  },
});

test.afterEach(async ({ page }, testInfo) => {
  await saveScenarioReport(page, testInfo);
});

export { expect } from '@playwright/test';
