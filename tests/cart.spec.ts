import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { ENV } from '../utils/env';
import { TEST_DATA } from '../utils/testData';

// 장바구니 기능: 추가 -> 진입 -> 제거
test('cart 기능 확인 @smoke @regression', async ({ page }) => {
  // [시나리오] 단일 상품 기준 장바구니 기본 동작 검증
  // - 추가 시 배지 증가, 카트 진입, 제거 후 비어있는 상태
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  const expectedBadgeCount = TEST_DATA.cart.singleBadgeCount;
  const expectedCartUrl = TEST_DATA.cart.cartUrl;
  const expectedEmptyItemCount = TEST_DATA.cart.emptyItemCount;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);

  // 상품 추가 시 카트 뱃지 숫자 증가 검증
  await inventoryPage.addBackpackToCart();
  const cartBadge = inventoryPage.getCartBadge();
  try {
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toContainText(expectedBadgeCount);
    console.log('장바구니 추가 후 뱃지 숫자 검증 성공');
  } catch (error) {
    const actualBadgeText = await cartBadge.textContent();
    console.error(`장바구니 추가 후 뱃지 숫자 검증 실패 - 예상: ${expectedBadgeCount}, 실제: ${actualBadgeText}`);
    throw new Error('장바구니 추가 후 뱃지 숫자 검증 실패');
  }

  // 카트 페이지 진입 URL 검증
  await inventoryPage.openCart();
  const currentCartUrl = page.url();
  try {
    expect(currentCartUrl).toBe(expectedCartUrl);
    console.log('장바구니 페이지 진입 검증 성공');
  } catch (error) {
    console.error(`장바구니 페이지 진입 검증 실패 - 예상: ${expectedCartUrl}, 실제: ${currentCartUrl}`);
    throw new Error(`장바구니 페이지 진입 검증 실패: ${currentCartUrl}`);
  }

  // 카트에서 상품 제거 후 비어있는지 검증
  await cartPage.removeBackpack();
  const cartItems = cartPage.getCartItems();
  try {
    await expect(cartItems).toHaveCount(expectedEmptyItemCount);
    console.log('장바구니 상품 제거 검증 성공');
  } catch (error) {
    const actualItemCount = await cartItems.count();
    console.error(`장바구니 상품 제거 검증 실패 - 예상: ${expectedEmptyItemCount}, 실제: ${actualItemCount}`);
    throw new Error('장바구니 상품 제거 검증 실패');
  }
});

// 복수 상품 추가 후 카트 수량/카트 목록 일치 검증
test('cart 복수 상품 상태 유지 확인 @regression', async ({ page }) => {
  // [시나리오] 여러 상품 추가 시 상단 배지 수와 카트 목록 수가 일치해야 함
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const expectedBadgeCount = TEST_DATA.cart.multiBadgeCount;
  const expectedCartItemCount = TEST_DATA.cart.multiItemCount;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await inventoryPage.addItemToCartById('sauce-labs-backpack');
  await inventoryPage.addItemToCartById('sauce-labs-bike-light');

  const cartBadge = inventoryPage.getCartBadge();
  try {
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toContainText(expectedBadgeCount);
    console.log('복수 상품 추가 뱃지 검증 성공');
  } catch (error) {
    const actualBadgeText = await cartBadge.textContent();
    console.error(`복수 상품 추가 뱃지 검증 실패 - 예상: ${expectedBadgeCount}, 실제: ${actualBadgeText}`);
    throw new Error('복수 상품 추가 뱃지 검증 실패');
  }

  await inventoryPage.openCart();
  const cartItems = cartPage.getCartItems();
  try {
    await expect(cartItems).toHaveCount(expectedCartItemCount);
    console.log('복수 상품 카트 목록 검증 성공');
  } catch (error) {
    throw new Error('복수 상품 카트 목록 검증 실패');
  }
});

// Continue Shopping 후 인벤토리 복귀/카트 배지 유지 검증
test('cart Continue Shopping 상태 유지 확인 @regression', async ({ page }) => {
  // [시나리오] 카트에서 목록 복귀(Continue Shopping) 후에도 카트 상태가 유지되어야 함
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const expectedInventoryUrl = ENV.INVENTORY_URL;
  const expectedBadgeCount = TEST_DATA.cart.singleBadgeCount;
  const expectedInventoryTitle = TEST_DATA.ui.inventoryTitle;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);
  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.continueShopping();

  const currentUrl = page.url();
  const inventoryTitle = page.locator('[data-test="title"]');
  const cartBadge = inventoryPage.getCartBadge();

  try {
    expect(currentUrl).toBe(expectedInventoryUrl);
    await expect(inventoryTitle).toContainText(expectedInventoryTitle);
    console.log('Continue Shopping 인벤토리 복귀 검증 성공');
  } catch (error) {
    const actualTitle = await inventoryTitle.textContent();
    console.error(`Continue Shopping 인벤토리 복귀 검증 실패 - 예상 URL: ${expectedInventoryUrl}, 실제 URL: ${currentUrl}, 예상 타이틀: ${expectedInventoryTitle}, 실제 타이틀: ${actualTitle}`);
    throw new Error(`Continue Shopping 인벤토리 복귀 검증 실패: ${currentUrl}`);
  }

  try {
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toContainText(expectedBadgeCount);
    console.log('Continue Shopping 카트 상태 유지 검증 성공');
  } catch (error) {
    const actualBadgeText = await cartBadge.textContent();
    console.error(`Continue Shopping 카트 상태 유지 검증 실패 - 예상: ${expectedBadgeCount}, 실제: ${actualBadgeText}`);
    throw new Error('Continue Shopping 카트 상태 유지 검증 실패');
  }
});
