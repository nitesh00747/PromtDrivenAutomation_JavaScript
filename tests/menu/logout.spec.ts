// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Logout', () => {
  test('Logging out via the burger menu returns to the login page and clears the session', async ({ page }) => {
    // Seed: log in as standard_user to reach the inventory page.
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Expect URL is /inventory.html.
    await expect(page).toHaveURL(/inventory\.html/);

    // Click the 'Open Menu' burger button (#react-burger-menu-btn) to open the side menu.
    await page.locator('#react-burger-menu-btn').click();

    // Expect the menu is visible with 'All Items', 'Logout', and 'Reset App State' options visible.
    const allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    const logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    const resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    await expect(allItemsLink).toBeVisible();
    await expect(logoutLink).toBeVisible();
    await expect(resetAppStateLink).toBeVisible();

    // Click 'Logout'.
    await logoutLink.click();

    // Expect URL navigates to the login page ('/') and the login form (Username, Password, Login button) is visible.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();

    // Attempt to navigate directly to /inventory.html via the browser address bar.
    await page.goto('/inventory.html');

    // Expect the app redirects back to the login page ('/') instead of showing the inventory page, confirming the session was cleared.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
