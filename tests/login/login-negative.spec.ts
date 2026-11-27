// spec: specs/login-and-inventory.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { NO_AUTH, USERS } from '../../test-data/users';

test.describe('Login - Negative Scenarios', () => {
  test.use({ storageState: NO_AUTH });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    // Form visible, no error banner yet
    await expect(loginPage.form).toBeVisible();
    await expect(loginPage.error).not.toBeVisible();
  });

  test('locked_out_user is denied login with correct password', async ({ page, loginPage }) => {
    await loginPage.login(USERS.lockedOut);

    // Denied: stays on the login page, exact error text, with a 'Dismiss error' button
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(loginPage.dismissErrorButton).toBeVisible();
  });

  test('valid username with wrong password is denied login', async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard, 'wrong_password');

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });
});
