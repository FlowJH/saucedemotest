import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { ENV } from '../utils/env';

// standard_user 로그인 후 로그아웃 동작 검증
test('standard_user 로그아웃 확인 @smoke @regression', async ({ page }) => {
  // [시나리오] 세션 종료 시 기본 보안 동작 검증
  // - 로그아웃 URL 복귀, 로그인 버튼 재노출
  const loginPage = new LoginPage(page);
  const expectedLogoutUrl = ENV.BASE_URL;
  const loginButton = loginPage.getLoginButton();

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await loginPage.logout();

  const currentUrl = page.url();
  // 로그아웃 시 로그인 페이지 URL로 이동하는지 확인
  try {
    expect(currentUrl).toBe(expectedLogoutUrl);
    console.log('로그아웃 후 URL 검증 성공');
  } catch (error) {
    throw new Error(`로그아웃 후 URL 검증 실패: ${currentUrl}`);
  }

  // 로그아웃 후 로그인 버튼이 다시 보이는지 확인
  try {
    await expect(loginButton).toBeVisible();
    console.log('로그아웃 후 로그인 버튼 노출 검증 성공');
  } catch (error) {
    throw new Error('로그아웃 후 로그인 버튼 노출 검증 실패');
  }
});

// 로그아웃 후 브라우저 뒤로가기 접근 보호 검증
test('로그아웃 후 뒤로가기 접근 차단 @regression', async ({ page }) => {
  // [시나리오] 로그아웃 후 뒤로가기로 보호 페이지에 남아도
  // 새로고침 시 인증이 끊긴 상태로 로그인 화면으로 강제 이동되어야 함
  const loginPage = new LoginPage(page);
  const expectedInventoryUrl = ENV.INVENTORY_URL;
  const expectedLogoutUrl = ENV.BASE_URL;
  const loginButton = loginPage.getLoginButton();

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await loginPage.logout();
  await page.goBack();
  const backUrl = page.url();
  await page.reload();

  const currentUrl = page.url();
  try {
    expect(backUrl).toBe(expectedInventoryUrl);
    expect(currentUrl).toBe(expectedLogoutUrl);
    console.log('로그아웃 후 뒤로가기/새로고침 URL 보호 검증 성공');
  } catch (error) {
    throw new Error(
      `로그아웃 후 뒤로가기/새로고침 URL 보호 검증 실패: back=${backUrl}, reload=${currentUrl}`
    );
  }

  try {
    await expect(loginButton).toBeVisible();
    console.log('로그아웃 후 뒤로가기 로그인 버튼 노출 검증 성공');
  } catch (error) {
    throw new Error('로그아웃 후 뒤로가기 로그인 버튼 노출 검증 실패');
  }
});