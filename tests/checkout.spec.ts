import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ENV } from '../utils/env';
import { TEST_DATA } from '../utils/testData';

async function moveToCheckoutStepOne(
  loginPage: LoginPage,
  inventoryPage: InventoryPage,
  cartPage: CartPage
) {
  // [공통 단계] 결제 Step One 진입까지의 반복 동선을 공통화
  // - 로그인 -> 상품 추가 -> 카트 진입 -> Checkout 시작
  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.checkout();
}

// 정상 결제 플로우: 장바구니 -> 정보 입력 -> 완료
test('checkout 완료 확인 @smoke @regression', async ({ page }) => {
  // [시나리오] 실제 구매 완료까지 이어지는 happy path 검증
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  const firstName = TEST_DATA.checkout.firstName;
  const lastName = TEST_DATA.checkout.lastName;
  const postalCode = TEST_DATA.checkout.postalCode;
  const expectedCompleteText = TEST_DATA.checkout.completeText;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.checkout();
  await checkoutPage.fillInformation(firstName, lastName, postalCode);
  await checkoutPage.continueCheckout();
  await checkoutPage.finishCheckout();

  // 주문 완료 메시지 검증
  const completeHeader = checkoutPage.getCompleteHeader();
  try {
    await expect(completeHeader).toBeVisible();
    await expect(completeHeader).toContainText(expectedCompleteText);
    console.log('결제 완료 검증 성공');
  } catch (error) {
    const actualCompleteText = await completeHeader.textContent();
    console.error(`결제 완료 검증 실패 - 예상: ${expectedCompleteText}, 실제: ${actualCompleteText}`);
    throw new Error('결제 완료 검증 실패');
  }
});

// 에러 케이스: 결제 정보 미입력 시 에러 노출 검증
test('checkout 정보 미입력 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] 입력 없이 Continue 시 필수값 에러가 노출되는지 검증
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  const expectedErrorText = TEST_DATA.errors.checkoutFirstNameRequired;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.checkout();
  await checkoutPage.continueCheckout();

  // First Name 미입력 에러 메시지 검증
  const errorMessage = checkoutPage.getErrorMessage();
  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('결제 정보 미입력 에러 검증 성공');
  } catch (error) {
    const actualErrorText = await errorMessage.textContent();
    console.error(`결제 정보 미입력 에러 검증 실패 - 예상: ${expectedErrorText}, 실제: ${actualErrorText}`);
    throw new Error('결제 정보 미입력 에러 검증 실패');
  }
});

// 에러 케이스: Last Name 미입력 시 에러 노출 검증
test('checkout Last Name 미입력 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] Last Name 누락 시 해당 필드 에러가 정확히 노출되는지 확인
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const firstName = TEST_DATA.checkout.firstName;
  const lastName = '';
  const postalCode = TEST_DATA.checkout.postalCode;
  const expectedErrorText = TEST_DATA.errors.checkoutLastNameRequired;

  await moveToCheckoutStepOne(loginPage, inventoryPage, cartPage);
  await checkoutPage.fillInformation(firstName, lastName, postalCode);
  await checkoutPage.continueCheckout();

  const errorMessage = checkoutPage.getErrorMessage();
  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('checkout Last Name 미입력 에러 검증 성공');
  } catch (error) {
    const actualErrorText = await errorMessage.textContent();
    console.error(`checkout Last Name 미입력 에러 검증 실패 - 예상: ${expectedErrorText}, 실제: ${actualErrorText}`);
    throw new Error('checkout Last Name 미입력 에러 검증 실패');
  }
});

// 에러 케이스: Postal Code 미입력 시 에러 노출 검증
test('checkout Postal Code 미입력 에러 확인 @negative @regression', async ({ page }) => {
  // [시나리오] Postal Code 누락 시 해당 필드 에러가 정확히 노출되는지 확인
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const firstName = TEST_DATA.checkout.firstName;
  const lastName = TEST_DATA.checkout.lastName;
  const postalCode = '';
  const expectedErrorText = TEST_DATA.errors.checkoutPostalCodeRequired;

  await moveToCheckoutStepOne(loginPage, inventoryPage, cartPage);
  await checkoutPage.fillInformation(firstName, lastName, postalCode);
  await checkoutPage.continueCheckout();

  const errorMessage = checkoutPage.getErrorMessage();
  try {
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(expectedErrorText);
    console.log('checkout Postal Code 미입력 에러 검증 성공');
  } catch (error) {
    const actualErrorText = await errorMessage.textContent();
    console.error(`checkout Postal Code 미입력 에러 검증 실패 - 예상: ${expectedErrorText}, 실제: ${actualErrorText}`);
    throw new Error('checkout Postal Code 미입력 에러 검증 실패');
  }
});

// checkout 단계별 URL/타이틀 검증
test('checkout 단계별 이동 확인 @regression', async ({ page }) => {
  // [시나리오] Step One -> Step Two -> Complete로 단계 전환이 정확한지 검증
  // - 단계별 URL/타이틀/완료 문구 기준으로 상태 확인
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const firstName = TEST_DATA.checkout.firstName;
  const lastName = TEST_DATA.checkout.lastName;
  const postalCode = TEST_DATA.checkout.postalCode;
  const expectedStepOneUrl = TEST_DATA.checkout.stepOneUrl;
  const expectedStepTwoUrl = TEST_DATA.checkout.stepTwoUrl;
  const expectedCompleteUrl = TEST_DATA.checkout.completeUrl;
  const expectedStepOneTitle = TEST_DATA.checkout.stepOneTitle;
  const expectedStepTwoTitle = TEST_DATA.checkout.stepTwoTitle;
  const expectedCompleteText = TEST_DATA.checkout.completeText;

  await moveToCheckoutStepOne(loginPage, inventoryPage, cartPage);
  const checkoutTitle = checkoutPage.getCheckoutTitle();
  const stepOneUrl = page.url();

  try {
    expect(stepOneUrl).toBe(expectedStepOneUrl);
    await expect(checkoutTitle).toContainText(expectedStepOneTitle);
    console.log('checkout step one URL/타이틀 검증 성공');
  } catch (error) {
    const actualTitle = await checkoutTitle.textContent();
    console.error(`checkout step one URL/타이틀 검증 실패 - 예상 URL: ${expectedStepOneUrl}, 실제 URL: ${stepOneUrl}, 예상 타이틀: ${expectedStepOneTitle}, 실제 타이틀: ${actualTitle}`);
    throw new Error(`checkout step one URL/타이틀 검증 실패: ${stepOneUrl}`);
  }

  await checkoutPage.fillInformation(firstName, lastName, postalCode);
  await checkoutPage.continueCheckout();
  const stepTwoUrl = page.url();

  try {
    expect(stepTwoUrl).toBe(expectedStepTwoUrl);
    await expect(checkoutTitle).toContainText(expectedStepTwoTitle);
    console.log('checkout step two URL/타이틀 검증 성공');
  } catch (error) {
    const actualTitle = await checkoutTitle.textContent();
    console.error(`checkout step two URL/타이틀 검증 실패 - 예상 URL: ${expectedStepTwoUrl}, 실제 URL: ${stepTwoUrl}, 예상 타이틀: ${expectedStepTwoTitle}, 실제 타이틀: ${actualTitle}`);
    throw new Error(`checkout step two URL/타이틀 검증 실패: ${stepTwoUrl}`);
  }

  await checkoutPage.finishCheckout();
  const completeUrl = page.url();
  const completeHeader = checkoutPage.getCompleteHeader();
  try {
    expect(completeUrl).toBe(expectedCompleteUrl);
    await expect(completeHeader).toContainText(expectedCompleteText);
    console.log('checkout complete URL/완료 메시지 검증 성공');
  } catch (error) {
    const actualCompleteHeader = await completeHeader.textContent();
    console.error(`checkout complete URL/완료 메시지 검증 실패 - 예상 URL: ${expectedCompleteUrl}, 실제 URL: ${completeUrl}, 예상 메시지: ${expectedCompleteText}, 실제 메시지: ${actualCompleteHeader}`);
    throw new Error(`checkout complete URL/완료 메시지 검증 실패: ${completeUrl}`);
  }
});

// checkout 취소 플로우: Step One 취소 시 카트 복귀
test('checkout step one 취소 동작 확인 @regression', async ({ page }) => {
  // [시나리오] 개인정보 입력 단계에서 취소 시 카트로 복귀해야 함
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const expectedCartUrl = TEST_DATA.cart.cartUrl;
  const expectedCartTitle = TEST_DATA.ui.cartTitle;

  await moveToCheckoutStepOne(loginPage, inventoryPage, cartPage);
  await checkoutPage.cancelCheckout();
  const currentUrl = page.url();
  const cartTitle = cartPage.getCartTitle();

  try {
    expect(currentUrl).toBe(expectedCartUrl);
    await expect(cartTitle).toContainText(expectedCartTitle);
    console.log('checkout step one 취소 카트 복귀 검증 성공');
  } catch (error) {
    const actualTitle = await cartTitle.textContent();
    console.error(`checkout step one 취소 카트 복귀 검증 실패 - 예상 URL: ${expectedCartUrl}, 실제 URL: ${currentUrl}, 예상 타이틀: ${expectedCartTitle}, 실제 타이틀: ${actualTitle}`);
    throw new Error(`checkout step one 취소 카트 복귀 검증 실패: ${currentUrl}`);
  }
});

// checkout 취소 플로우: Step Two 취소 시 인벤토리 복귀
test('checkout step two 취소 동작 확인 @regression', async ({ page }) => {
  // [시나리오] 주문 개요 단계에서 취소 시 상품 목록으로 복귀해야 함
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const firstName = TEST_DATA.checkout.firstName;
  const lastName = TEST_DATA.checkout.lastName;
  const postalCode = TEST_DATA.checkout.postalCode;
  const expectedInventoryUrl = ENV.INVENTORY_URL;
  const expectedInventoryTitle = TEST_DATA.ui.inventoryTitle;

  await moveToCheckoutStepOne(loginPage, inventoryPage, cartPage);
  await checkoutPage.fillInformation(firstName, lastName, postalCode);
  await checkoutPage.continueCheckout();
  await checkoutPage.cancelCheckout();
  const currentUrl = page.url();
  const inventoryTitle = page.locator('[data-test="title"]');

  try {
    expect(currentUrl).toBe(expectedInventoryUrl);
    await expect(inventoryTitle).toContainText(expectedInventoryTitle);
    console.log('checkout step two 취소 인벤토리 복귀 검증 성공');
  } catch (error) {
    const actualTitle = await inventoryTitle.textContent();
    console.error(`checkout step two 취소 인벤토리 복귀 검증 실패 - 예상 URL: ${expectedInventoryUrl}, 실제 URL: ${currentUrl}, 예상 타이틀: ${expectedInventoryTitle}, 실제 타이틀: ${actualTitle}`);
    throw new Error(`checkout step two 취소 인벤토리 복귀 검증 실패: ${currentUrl}`);
  }
});
