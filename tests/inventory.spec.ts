import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ENV } from '../utils/env';
import { TEST_DATA } from '../utils/testData';
import { isNumberArraySorted, isStringArraySorted } from '../utils/sortAssert';

// 인벤토리 핵심 기능: 상품 노출/정렬/상세/뒤로가기
test('inventory 페이지 기능 확인 @smoke @regression', async ({ page }) => {
  // [시나리오] 사용자가 인벤토리 화면에서 수행하는 핵심 탐색 동선 검증
  // - 목록 진입 -> 정렬 변경 -> 상세 진입 -> 목록 복귀
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  const expectedItemCount = TEST_DATA.inventory.expectedItemCount;
  const expectedInventoryUrl = ENV.INVENTORY_URL;
  const expectedDetailUrl = TEST_DATA.inventory.backpackDetailUrl;
  const sortAzValue = TEST_DATA.inventory.sort.az;
  const sortZaValue = TEST_DATA.inventory.sort.za;
  const sortLoHiValue = TEST_DATA.inventory.sort.lohi;
  const sortHiLoValue = TEST_DATA.inventory.sort.hilo;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);

  // 인벤토리 아이템 수(기본 데이터셋) 정상 노출 여부 검증
  const inventoryItems = inventoryPage.getInventoryItems();
  try {
    await expect(inventoryItems).toHaveCount(expectedItemCount);
    console.log(`상품 ${expectedItemCount}개 노출 검증 성공`);
  } catch (error) {
    const actualCount = await inventoryItems.count();
    console.error(`상품 ${expectedItemCount}개 노출 검증 실패 - 실제: ${actualCount}개`);
    throw new Error('상품 6개 노출 검증 실패');
  }

  // 정렬 셀렉트 값이 A-Z로 반영되는지 UI 상태 검증
  const sortDropdown = inventoryPage.getSortDropdown();
  // 정렬 셀렉트 값이 Z-A로 반영되는지 UI 상태 검증
  try {
    await inventoryPage.sortBy(sortAzValue);
    await expect(sortDropdown).toHaveValue(sortAzValue);
    console.log('A-Z 정렬 검증 성공');
  } catch (error) {
    const actualValue = await sortDropdown.inputValue();
    console.error(`A-Z 정렬 검증 실패 - 예상: ${sortAzValue}, 실제: ${actualValue}`);
    throw new Error('A-Z 정렬 검증 실패');
  }

  // 정렬 셀렉트 값이 가격 낮은순으로 반영되는지 UI 상태 검증
  try {
    await inventoryPage.sortBy(sortZaValue);
    await expect(sortDropdown).toHaveValue(sortZaValue);
    console.log('Z-A 정렬 검증 성공');
  } catch (error) {
    throw new Error('Z-A 정렬 검증 실패');
  }

  // 정렬 셀렉트 값이 가격 높은순으로 반영되는지 UI 상태 검증
  try {
    await inventoryPage.sortBy(sortLoHiValue);
    await expect(sortDropdown).toHaveValue(sortLoHiValue);
    console.log('가격 낮은순 정렬 검증 성공');
  } catch (error) {
    throw new Error('가격 낮은순 정렬 검증 실패');
  }

  try {
    await inventoryPage.sortBy(sortHiLoValue);
    await expect(sortDropdown).toHaveValue(sortHiLoValue);
    console.log('가격 높은순 정렬 검증 성공');
  } catch (error) {
    throw new Error('가격 높은순 정렬 검증 실패');
  }

  // 특정 상품 클릭 시 상세 페이지 URL로 이동하는지 검증
  await inventoryPage.openBackpackDetail();
  const detailUrl = page.url();
  try {
    expect(detailUrl).toBe(expectedDetailUrl);
    console.log('상품 상세 페이지 진입 검증 성공');
  } catch (error) {
    throw new Error(`상품 상세 페이지 진입 검증 실패: ${detailUrl}`);
  }

  // 상세 화면의 Back 버튼으로 inventory로 복귀되는지 검증
  await inventoryPage.backToProducts();
  const currentUrl = page.url();
  try {
    expect(currentUrl).toBe(expectedInventoryUrl);
    console.log('상세 페이지 뒤로가기 검증 성공');
  } catch (error) {
    throw new Error(`상세 페이지 뒤로가기 검증 실패: ${currentUrl}`);
  }
});

// 인벤토리 데이터(상품명/가격/이미지) 기본 품질 검증
test('inventory 상품 데이터 노출 확인 @regression', async ({ page }) => {
  // [시나리오] 상품 카드 기본 품질 점검
  // - 이름/가격/이미지 개수 일치, 빈 데이터/비정상 가격/비노출 이미지 탐지
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const expectedItemCount = TEST_DATA.inventory.expectedItemCount;
  const minimumPrice = TEST_DATA.inventory.minimumPrice;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);

  const itemNames = inventoryPage.getItemNames();
  const itemPrices = inventoryPage.getItemPrices();
  const itemImages = inventoryPage.getItemImages();

  try {
    await expect(itemNames).toHaveCount(expectedItemCount);
    await expect(itemPrices).toHaveCount(expectedItemCount);
    await expect(itemImages).toHaveCount(expectedItemCount);
    console.log('상품명/가격/이미지 개수 검증 성공');
  } catch (error) {
    throw new Error('상품명/가격/이미지 개수 검증 실패');
  }

  const nameTexts = await itemNames.allTextContents();
  const priceTexts = await itemPrices.allTextContents();
  const imageCount = await itemImages.count();
  const visibleResults = await Promise.all(
    Array.from({ length: imageCount }, (_, index) => itemImages.nth(index).isVisible())
  );
  const parsedPrices = priceTexts.map((value) => Number(value.replace('$', '')));
  const hasEmptyName = nameTexts.some((value) => value.trim().length === 0);
  const hasInvalidPrice = parsedPrices.some((value) => Number.isNaN(value) || value <= minimumPrice);
  const hasHiddenImage = visibleResults.some((value) => value === false);

  try {
    expect(hasEmptyName).toBe(false);
    expect(hasInvalidPrice).toBe(false);
    expect(hasHiddenImage).toBe(false);
    console.log('상품명/가격 유효성 및 이미지 노출 검증 성공');
  } catch (error) {
    throw new Error('상품명/가격 유효성 및 이미지 노출 검증 실패');
  }
});

// 정렬 선택 후 실제 데이터 순서까지 검증
test('inventory 정렬 실제 순서 검증 @regression', async ({ page }) => {
  // [시나리오] 드롭다운 값 변경뿐 아니라 실제 렌더링 순서까지 검증
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const sortAzValue = TEST_DATA.inventory.sort.az;
  const sortZaValue = TEST_DATA.inventory.sort.za;
  const sortLoHiValue = TEST_DATA.inventory.sort.lohi;
  const sortHiLoValue = TEST_DATA.inventory.sort.hilo;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.STANDARD, ENV.PASSWORD);

  await inventoryPage.sortBy(sortAzValue);
  const azNames = await inventoryPage.getItemNames().allTextContents();
  const isAzSorted = isStringArraySorted(azNames, 'asc');
  try {
    expect(isAzSorted).toBe(true);
    console.log('A-Z 실제 순서 검증 성공');
  } catch (error) {
    throw new Error('A-Z 실제 순서 검증 실패');
  }

  await inventoryPage.sortBy(sortZaValue);
  const zaNames = await inventoryPage.getItemNames().allTextContents();
  const isZaSorted = isStringArraySorted(zaNames, 'desc');
  try {
    expect(isZaSorted).toBe(true);
    console.log('Z-A 실제 순서 검증 성공');
  } catch (error) {
    throw new Error('Z-A 실제 순서 검증 실패');
  }

  await inventoryPage.sortBy(sortLoHiValue);
  const loHiPrices = (await inventoryPage.getItemPrices().allTextContents()).map((value) =>
    Number(value.replace('$', ''))
  );
  const isLoHiSorted = isNumberArraySorted(loHiPrices, 'asc');
  try {
    expect(isLoHiSorted).toBe(true);
    console.log('가격 낮은순 실제 순서 검증 성공');
  } catch (error) {
    throw new Error('가격 낮은순 실제 순서 검증 실패');
  }

  await inventoryPage.sortBy(sortHiLoValue);
  const hiLoPrices = (await inventoryPage.getItemPrices().allTextContents()).map((value) =>
    Number(value.replace('$', ''))
  );
  const isHiLoSorted = isNumberArraySorted(hiLoPrices, 'desc');
  try {
    expect(isHiLoSorted).toBe(true);
    console.log('가격 높은순 실제 순서 검증 성공');
  } catch (error) {
    throw new Error('가격 높은순 실제 순서 검증 실패');
  }
});

// problem_user 계정의 이미지 불일치(문제 계정) 탐지 검증
test('problem_user 이미지 불일치 탐지 @negative @regression', async ({ page }) => {
  // [시나리오] 의도적으로 문제를 가진 계정에서 이미지 이상 현상이 재현되는지 확인
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const expectedImageKeyword = TEST_DATA.inventory.problemUserUnexpectedKeyword;

  await loginPage.goto();
  await loginPage.login(ENV.USERS.PROBLEM, ENV.PASSWORD);
  const backpackImage = inventoryPage.getItemImages().first();

  const imageSrc = await backpackImage.getAttribute('src');
  const containsExpectedKeyword = (imageSrc ?? '').includes(expectedImageKeyword);

  try {
    expect(containsExpectedKeyword).toBe(false);
    console.log('problem_user 이미지 불일치 탐지 성공');
  } catch (error) {
    throw new Error(`problem_user 이미지 불일치 탐지 실패: src=${imageSrc}`);
  }
});
