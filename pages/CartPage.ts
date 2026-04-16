import { Page } from '@playwright/test';

export class CartPage {
  // Cart 화면에서 재사용되는 핵심 요소 모음
  private readonly cartItem;
  private readonly removeBackpackButton;
  private readonly checkoutButton;
  private readonly continueShoppingButton;
  private readonly cartTitle;

  constructor(private readonly page: Page) {
    this.cartItem = this.page.locator('[data-test="inventory-item"]');
    this.removeBackpackButton = this.page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.checkoutButton = this.page.locator('[data-test="checkout"]');
    this.continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');
    this.cartTitle = this.page.locator('[data-test="title"]');
  }

  // 카트 내 상품 카드 목록(개수 비교)
  getCartItems() {
    return this.cartItem;
  }

  // Backpack 제거 버튼 클릭
  async removeBackpack() {
    await this.removeBackpackButton.click();
  }

  // 결제 플로우 시작(Step One 이동)
  async checkout() {
    await this.checkoutButton.click();
  }

  // 상품 목록으로 복귀하되 카트 상태는 유지
  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  // 화면 타이틀(Your Cart) 검증용 요소
  getCartTitle() {
    return this.cartTitle;
  }
}
