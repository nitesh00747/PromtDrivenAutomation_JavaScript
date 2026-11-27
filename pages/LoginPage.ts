import type { Locator, Page } from '@playwright/test';
import { PASSWORD } from '../test-data/users';

export class LoginPage {
  readonly form: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  /** The error banner (login failures and "you can only access ... when logged in"). */
  readonly error: Locator;
  readonly dismissErrorButton: Locator;

  constructor(readonly page: Page) {
    this.form = page.getByRole('form', { name: 'Login' });
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.dismissErrorButton = this.error.getByRole('button', { name: 'Dismiss error' });
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Fill the form and submit. Does not assert the outcome, so it also serves negative tests. */
  async login(username: string, password: string = PASSWORD) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
