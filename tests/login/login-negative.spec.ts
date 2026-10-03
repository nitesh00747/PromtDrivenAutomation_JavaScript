// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login - Negative Scenarios', () => {
  test('locked_out_user is denied login with correct password', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Verify login form is displayed and no error banner is present yet
    const loginForm = page.getByRole('form', { name: 'Login' });
    await expect(loginForm).toBeVisible();
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();

    // Fill username 'locked_out_user', password 'secret_sauce' (the correct password)
    await page.locator('[data-test="username"]').fill('locked_out_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login
    await page.locator('[data-test="login-button"]').click();

    // Expect: login is denied — URL remains on the login page ('/') and does NOT navigate to /inventory.html;
    // an error alert is displayed with the exact text; the error element is selectable via
    // [data-test="error"] and includes a 'Dismiss error' button.
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page).toHaveURL('/');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(errorBanner.getByRole('button', { name: 'Dismiss error' })).toBeVisible();
  });

  test('valid username with wrong password is denied login', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Verify login form is displayed and no error banner is present yet
    const loginForm = page.getByRole('form', { name: 'Login' });
    await expect(loginForm).toBeVisible();
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();

    // Fill username 'standard_user' (valid/accepted username), password 'wrong_password' (an incorrect password)
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('wrong_password');

    // Click Login
    await page.locator('[data-test="login-button"]').click();

    // Expect: login is denied — URL remains on the login page ('/') and does NOT navigate to /inventory.html;
    // an error alert is displayed with the exact text; the error element is selectable via [data-test="error"].
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page).toHaveURL('/');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });
});
