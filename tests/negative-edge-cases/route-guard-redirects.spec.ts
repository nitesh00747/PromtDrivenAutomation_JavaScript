// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Protected Pages Require Active Login Session', () => {
  test('Direct navigation to /inventory.html without a session redirects to login with page-specific error', async ({ page }) => {
    // With no login performed, navigate directly to /inventory.html.
    await page.goto('/inventory.html');

    // expect: the browser ends up on '/' (URL does not remain on /inventory.html)
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // expect: an alert h3[data-test="error"] is visible with exact text
    const errorAlert = page.locator('h3[data-test="error"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText("Epic sadface: You can only access '/inventory.html' when you are logged in.");

    // expect: the Username/Password/Login-button login form is visible
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('Direct navigation to /cart.html without a session redirects to login with page-specific error', async ({ page }) => {
    // With no login, navigate directly to /cart.html.
    await page.goto('/cart.html');

    // expect: redirected to '/', error alert text exactly matches
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/cart.html' when you are logged in.");
  });

  test('Direct navigation to /checkout-step-one.html without a session redirects to login with page-specific error', async ({ page }) => {
    // With no login, navigate directly to /checkout-step-one.html.
    await page.goto('/checkout-step-one.html');

    // expect: redirected to '/', error alert text exactly matches
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.");
  });

  test('Direct navigation to /checkout-step-two.html without a session redirects to login with page-specific error', async ({ page }) => {
    // With no login, navigate directly to /checkout-step-two.html.
    await page.goto('/checkout-step-two.html');

    // expect: redirected to '/', error alert text exactly matches
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");
  });

  test('Direct navigation to /checkout-complete.html without a session redirects to login with page-specific error', async ({ page }) => {
    // With no login, navigate directly to /checkout-complete.html.
    await page.goto('/checkout-complete.html');

    // expect: redirected to '/', error alert text exactly matches
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/checkout-complete.html' when you are logged in.");
  });

  test('Direct navigation to /inventory-item.html?id=4 without a session redirects to login with path-only error (query string dropped)', async ({ page }) => {
    // With no login, navigate directly to /inventory-item.html?id=4.
    await page.goto('/inventory-item.html?id=4');

    // expect: redirected to '/', error alert text exactly matches with only the pathname (query string dropped)
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/inventory-item.html' when you are logged in.");
  });

  test('After logging out mid-session, previously accessible protected pages become inaccessible again', async ({ page }) => {
    // Perform the real login (seed steps).
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');

    // expect: URL is /inventory.html
    await expect(page).toHaveURL(/inventory\.html/);

    // Open the burger menu and click 'Logout'.
    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="logout-sidebar-link"]');

    // expect: URL navigates to '/' with the login form visible
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();

    // Attempt to navigate directly back to /inventory.html.
    await page.goto('/inventory.html');

    // expect: redirected to '/' again (session fully cleared), error alert text exactly matches
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('h3[data-test="error"]')).toHaveText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});
