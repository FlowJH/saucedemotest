import { Page } from '@playwright/test';

export class CheckoutPage {
  // Checkout Step One/Two/Complete에서 공통으로 쓰는 요소 모음
  private readonly firstNameInput;
  private readonly lastNameInput;
  private readonly postalCodeInput;
  private readonly continueButton;
  private readonly finishButton;
  private readonly completeHeader;
  private readonly errorMessage;
  private readonly checkoutTitle;
  private readonly cancelButton;

  constructor(private readonly page: Page) {
    this.firstNameInput = this.page.locator('[data-test="firstName"]');
    this.lastNameInput = this.page.locator('[data-test="lastName"]');
    this.postalCodeInput = this.page.locator('[data-test="postalCode"]');
    this.continueButton = this.page.locator('[data-test="continue"]');
    this.finishButton = this.page.locator('[data-test="finish"]');
    this.completeHeader = this.page.locator('[data-test="complete-header"]');
    this.errorMessage = this.page.locator('[data-test="error"]');
    this.checkoutTitle = this.page.locator('[data-test="title"]');
    this.cancelButton = this.page.locator('[data-test="cancel"]');
  }

  // Step One 입력 필드 3종을 한 번에 채우는 헬퍼
  async fillInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  // Step One -> Step Two 이동
  async continueCheckout() {
    await this.continueButton.click();
  }

  // Step Two -> Complete 이동
  async finishCheckout() {
    await this.finishButton.click();
  }

  // Complete 화면의 성공 메시지 검증용 헤더
  getCompleteHeader() {
    return this.completeHeader;
  }

  // Step One 유효성 검증 실패 메시지 영역
  getErrorMessage() {
    return this.errorMessage;
  }

  // 단계별 화면 타이틀(Your Information/Overview) 검증
  getCheckoutTitle() {
    return this.checkoutTitle;
  }

  // 현재 단계 취소 후 이전 안전 화면으로 복귀
  async cancelCheckout() {
    await this.cancelButton.click();
  }
}
