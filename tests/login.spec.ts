import { test, expect } from '../fixtures/auth.fixture';
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ENV } from '../utils/env';
import { TEST_DATA } from '../utils/testData';

const inventoryUrl = ENV.INVENTORY_URL;
const appLogoText = TEST_DATA.ui.appLogoText;

// [공통 단계] 어떤 계정이든 같은 로그인 절차를 타기 때문에 재사용 함수로 분리
// - 목적: 테스트마다 중복되는 페이지 이동/로그인 동작 제거
async function loginWithUser(page: Page, username: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, ENV.PASSWORD);
}

// [공통 검증] 로그인 성공의 최소 조건을 동일하게 검증
// - inventory URL 진입 여부
// - 상단 앱 로고 노출/텍스트 일치 여부
async function verifyLoginSuccess(page: Page, accountName: string) {
  const currentUrl = page.url();
  const inventoryPage = new InventoryPage(page);
  const appLogo = inventoryPage.getAppLogo();

  try {
    expect(currentUrl).toBe(inventoryUrl);
    console.log(`${accountName} URL 검증 성공: ${currentUrl}`);
  } catch (error) {
    console.error(`${accountName} URL 검증 실패 - 예상: ${inventoryUrl}, 실제: ${currentUrl}`);
    throw new Error(`${accountName} URL 검증 실패: ${currentUrl}`);
  }

  try {
    await expect(appLogo).toBeVisible();
    await expect(appLogo).toContainText(appLogoText);
    console.log(`${accountName} 앱 로고 검증 성공: "${appLogoText}"`);
  } catch (error) {
    const actualText = await appLogo.textContent();
    console.error(`${accountName} 앱 로고 검증 실패 - 예상: "${appLogoText}", 실제: "${actualText}"`);
    throw new Error(`${accountName} 앱 로고 검증 실패`);
  }
}

// [시나리오 그룹] 정상 로그인 가능 계정 묶음 검증
// - 동일한 성공 기준을 적용해 계정별 접근 가능 여부만 확인
[
  { name: 'standard_user', user: ENV.USERS.STANDARD },
  { name: 'problem_user', user: ENV.USERS.PROBLEM },
  { name: 'error_user', user: ENV.USERS.ERROR },
  { name: 'visual_user', user: ENV.USERS.VISUAL },
].forEach(({ name, user }) => {
  test(`${name} 로그인 성공 @smoke @regression`, async ({ page }) => {
    await loginWithUser(page, user);
    await verifyLoginSuccess(page, name);
  });
});

test('locked_out_user 로그인 차단 @negative @regression', async ({ page }) => {
  // [시나리오] 정책상 차단된 계정이 로그인되지 않아야 함
  await loginWithUser(page, ENV.USERS.LOCKED);

  const loginPage = new LoginPage(page);
  const errorMessage = loginPage.getErrorMessage();
  const expectedErrorText = TEST_DATA.errors.lockedOut;

  // 차단 계정 고정 문구로 서버 정책 적용 여부 검증
  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('locked_out_user 에러 메시지 검증 성공');
  } catch (error) {
    throw new Error('locked_out_user 에러 메시지 검증 실패');
  }
});

test('performance_glitch_user 로그인 성공 @regression', async ({ page }) => {
  // [시나리오] 성능 저하 계정은 느리더라도 최종 로그인 성공해야 함
  await loginWithUser(page, ENV.USERS.PERFORMANCE);

  const inventoryPage = new InventoryPage(page);
  const appLogo = inventoryPage.getAppLogo();
  const currentUrl = page.url();

  // 느린 계정 대응: 일반 계정보다 긴 대기(10초)로 성공 기준 확인
  try {
    expect(currentUrl).toBe(inventoryUrl);
    console.log('performance_glitch_user URL 검증 성공');
  } catch (error) {
    throw new Error(`performance_glitch_user URL 검증 실패: ${currentUrl}`);
  }

  try {
    await expect(appLogo).toBeVisible({ timeout: 10000 });
    await expect(appLogo).toContainText(appLogoText);
    console.log('performance_glitch_user 로고 검증 성공');
  } catch (error) {
    throw new Error('performance_glitch_user 로그인 검증 실패');
  }
});

// 로그인 입력값 누락/오입력 검증
test('로그인 입력값 누락 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] ID/PW 둘 다 비우면 사용자명 필수 에러가 우선 노출되는지 검증
  const loginPage = new LoginPage(page);
  const expectedErrorText = TEST_DATA.errors.usernameRequired;
  const errorMessage = loginPage.getErrorMessage();

  await loginPage.goto();
  await loginPage.login('', '');

  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('로그인 입력값 누락 에러 검증 성공');
  } catch (error) {
    throw new Error('로그인 입력값 누락 에러 검증 실패');
  }
});

test('로그인 아이디 미입력 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] 비밀번호만 입력한 경우 사용자명 필수 에러 검증
  const loginPage = new LoginPage(page);
  const expectedErrorText = TEST_DATA.errors.usernameRequired;
  const errorMessage = loginPage.getErrorMessage();

  await loginPage.goto();
  await loginPage.login('', ENV.PASSWORD);

  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('로그인 아이디 미입력 에러 검증 성공');
  } catch (error) {
    throw new Error('로그인 아이디 미입력 에러 검증 실패');
  }
});

test('로그인 비밀번호 미입력 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] 아이디만 입력한 경우 비밀번호 필수 에러 검증
  const loginPage = new LoginPage(page);
  const expectedErrorText = TEST_DATA.errors.passwordRequired;
  const errorMessage = loginPage.getErrorMessage();

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, '');

  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('로그인 비밀번호 미입력 에러 검증 성공');
  } catch (error) {
    throw new Error('로그인 비밀번호 미입력 에러 검증 실패');
  }
});

test('로그인 잘못된 계정 조합 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] 존재하지 않는 계정 조합의 인증 실패 메시지 검증
  const loginPage = new LoginPage(page);
  const invalidUsername = 'not_existing_user';
  const expectedErrorText = TEST_DATA.errors.invalidCredential;
  const errorMessage = loginPage.getErrorMessage();

  await loginPage.goto();
  await loginPage.login(invalidUsername, ENV.PASSWORD);

  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('로그인 잘못된 계정 조합 에러 검증 성공');
  } catch (error) {
    throw new Error('로그인 잘못된 계정 조합 에러 검증 실패');
  }
});

// 미로그인 상태에서 inventory 직접 접근 차단 검증
test('미로그인 inventory 직접 접근 차단 @negative @regression', async ({ page }) => {
  // [시나리오] 보호 URL 직접 접근 시 로그인 화면으로 강제 리다이렉트되어야 함
  const protectedUrl = ENV.INVENTORY_URL;
  const expectedRedirectUrl = ENV.BASE_URL;
  const loginPage = new LoginPage(page);
  const loginButton = loginPage.getLoginButton();

  await page.goto(protectedUrl);
  const currentUrl = page.url();

  try {
    expect(currentUrl).toBe(expectedRedirectUrl);
    console.log('미로그인 inventory 접근 리다이렉트 검증 성공');
  } catch (error) {
    throw new Error(`미로그인 inventory 접근 리다이렉트 검증 실패: ${currentUrl}`);
  }

  try {
    await expect(loginButton).toBeVisible();
    console.log('미로그인 상태 로그인 버튼 노출 검증 성공');
  } catch (error) {
    throw new Error('미로그인 상태 로그인 버튼 노출 검증 실패');
  }
});
