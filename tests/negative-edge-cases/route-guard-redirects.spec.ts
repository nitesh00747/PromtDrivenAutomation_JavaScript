// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { NO_AUTH, USERS } from '../../test-data/users';

test.describe('Protected Pages Require Active Login Session', () => {
  // Every test here starts logged out; the last one logs in through the form itself.
  test.use({ storageState: NO_AUTH });

  test('Direct navigation to /inventory.html without a session redirects to login with page-specific error', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    // Ends up on '/', with the page-specific error and the login form
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  // Same check for the other protected pages
  for (const path of ['/cart.html', '/checkout-step-one.html', '/checkout-step-two.html', '/checkout-complete.html']) {
    test(`Direct navigation to ${path} without a session redirects to login with page-specific error`, async ({ page, loginPage }) => {
      await page.goto(path);
      await expect(page).toHaveURL('/');
      await expect(loginPage.error).toHaveText(`Epic sadface: You can only access '${path}' when you are logged in.`);
    });
  }

  test('Direct navigation to /inventory-item.html?id=4 without a session redirects to login with path-only error (query string dropped)', async ({ page, loginPage }) => {
    await page.goto('/inventory-item.html?id=4');
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toHaveText("Epic sadface: You can only access '/inventory-item.html' when you are logged in.");
  });

  test('After logging out mid-session, previously accessible protected pages become inaccessible again', async ({ page, header, inventoryPage, loginPage }) => {
    // A real login through the form
    await loginPage.goto();
    await loginPage.login(USERS.standard);
    await expect(page).toHaveURL(/inventory\.html/);

    // Log out via the menu: login form visible
    await header.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();

    // Going back to /inventory.html redirects to login with the page-specific error
    await inventoryPage.goto();
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toHaveText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});
