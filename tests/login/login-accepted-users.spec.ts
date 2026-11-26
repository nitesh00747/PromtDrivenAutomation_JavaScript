// spec: specs/login-and-inventory.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login - Accepted Users', () => {
  test('standard_user logs in successfully', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Verify login form is displayed before submit
    const loginForm = page.getByRole('form', { name: 'Login' });
    await expect(loginForm).toBeVisible();

    // Fill username 'standard_user' and password 'secret_sauce'
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // Verify no error message shown and URL matches /inventory.html
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);

    // Verify 'Products' page title/header is visible
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('problem_user logs in successfully', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Fill username 'problem_user' and password 'secret_sauce'
    await page.locator('[data-test="username"]').fill('problem_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // Verify no error message shown and URL matches /inventory.html
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('performance_glitch_user logs in successfully', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Fill username 'performance_glitch_user' and password 'secret_sauce'
    await page.locator('[data-test="username"]').fill('performance_glitch_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // Verify no error message shown and URL matches /inventory.html
    // (this user simulates a performance delay before navigating, so allow a generous timeout)
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 15000 });
  });

  test('error_user logs in successfully', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Fill username 'error_user' and password 'secret_sauce'
    await page.locator('[data-test="username"]').fill('error_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // Verify no error message shown and URL matches /inventory.html
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('visual_user logs in successfully', async ({ page }) => {
    // Navigate to '/'
    await page.goto('/');

    // Fill username 'visual_user' and password 'secret_sauce'
    await page.locator('[data-test="username"]').fill('visual_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // Verify no error message shown and URL matches /inventory.html
    const errorBanner = page.locator('[data-test="error"]');
    await expect(errorBanner).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
