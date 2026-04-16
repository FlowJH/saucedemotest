import { Page } from '@playwright/test';

export class InventoryPage {
  // Inventory 화면의 주요 UI 요소를 한 곳에서 관리해
  // 테스트 코드가 selector 변경에 덜 민감하도록 구성
  private readonly appLogo;
  private readonly inventoryItems;
  private readonly sortDropdown;
  private readonly cartBadge;
  private readonly cartLink;
  private readonly backpackAddButton;
  private readonly backpackRemoveButton;
  private readonly backpackItemName;
  private readonly backToProductsButton;
  private readonly inventoryItemNames;
  private readonly inventoryItemPrices;
  private readonly inventoryItemImages;

  constructor(private readonly page: Page) {
    this.appLogo = this.page.locator('div.app_logo');
    this.inventoryItems = this.page.locator('[data-test="inventory-item"]');
    this.sortDropdown = this.page.locator('[data-test="product-sort-container"]');
    this.cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = this.page.locator('[data-test="shopping-cart-link"]');
    this.backpackAddButton = this.page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.backpackRemoveButton = this.page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.backpackItemName = this.page.locator('[data-test="item-4-title-link"]');
    this.backToProductsButton = this.page.locator('[data-test="back-to-products"]');
    this.inventoryItemNames = this.page.locator('[data-test="inventory-item-name"]');
    this.inventoryItemPrices = this.page.locator('[data-test="inventory-item-price"]');
    this.inventoryItemImages = this.page.locator('[data-test="inventory-item"] img.inventory_item_img');
  }

  // 로그인 성공 후 기준점으로 사용하는 상단 로고
  getAppLogo() {
    return this.appLogo;
  }

  // 상품 카드 전체 목록(개수 검증에 사용)
  getInventoryItems() {
    return this.inventoryItems;
  }

  // 정렬 옵션 변경용 드롭다운
  getSortDropdown() {
    return this.sortDropdown;
  }

  // 상품명 목록(정렬/품질 검증에 사용)
  getItemNames() {
    return this.inventoryItemNames;
  }

  // 상품 가격 목록(정렬/품질 검증에 사용)
  getItemPrices() {
    return this.inventoryItemPrices;
  }

  // 상품 이미지 목록(노출/문제 계정 검증에 사용)
  getItemImages() {
    return this.inventoryItemImages;
  }

  // 전달받은 정렬 키로 드롭다운 값을 변경
  async sortBy(optionValue: string) {
    await this.sortDropdown.selectOption(optionValue);
  }

  // 대표 상품(Backpack) 빠른 추가 헬퍼
  async addBackpackToCart() {
    await this.backpackAddButton.click();
  }

  // 특정 상품을 data-test id 기반으로 범용 추가
  async addItemToCartById(itemId: string) {
    const addButton = this.page.locator(`[data-test="add-to-cart-${itemId}"]`);
    await addButton.click();
  }

  // Backpack 상품 제거 헬퍼
  async removeBackpackFromCart() {
    await this.backpackRemoveButton.click();
  }

  // 우상단 카트 배지(담긴 상품 수 확인)
  getCartBadge() {
    return this.cartBadge;
  }

  // 카트 아이콘 클릭으로 카트 페이지 이동
  async openCart() {
    await this.cartLink.click();
  }

  // Backpack 상품 상세 페이지 진입
  async openBackpackDetail() {
    await this.backpackItemName.click();
  }

  // 상세 화면에서 목록으로 되돌아가기
  async backToProducts() {
    await this.backToProductsButton.click();
  }
}
