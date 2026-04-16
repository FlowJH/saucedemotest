import { Page } from '@playwright/test';

export class LoginPage {
  private readonly usernameInput;
  private readonly passwordInput;
  private readonly loginButton;
  private readonly errorMessage;
  private readonly menuButton;
  private readonly logoutLink;

  constructor(private readonly page: Page) {
    this.usernameInput = this.page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Password' });
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.errorMessage = this.page.locator('[data-test="error"]');
    this.menuButton = this.page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = this.page.getByRole('link', { name: 'Logout' });
  }

  // 로그인 페이지로 이동
  async goto() {
    await this.page.goto('/');
  }

  // 아이디/비밀번호 입력 후 로그인
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // 좌측 메뉴를 열고 로그아웃
  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  // 로그인 실패 에러 메시지 로케이터 반환
  getErrorMessage() {
    return this.errorMessage;
  }

  // 로그인 버튼 로케이터 반환
  getLoginButton() {
    return this.loginButton;
  }
}