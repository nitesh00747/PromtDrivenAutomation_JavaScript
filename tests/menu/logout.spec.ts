// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';

test.describe('Logout', () => {
  test('Logging out via the burger menu returns to the login page and clears the session', async ({ page, header, inventoryPage, loginPage }) => {
    await inventoryPage.goto();
    await expect(page).toHaveURL(/inventory\.html/);

    // Open the menu: 'All Items', 'Logout' and 'Reset App State' are visible
    await header.openMenu();
    await expect(header.allItemsLink).toBeVisible();
    await expect(header.logoutLink).toBeVisible();
    await expect(header.resetAppStateLink).toBeVisible();

    // Log out: back on the login page with the form visible
    await header.logoutLink.click();
    await expect(page).toHaveURL('/');
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Going straight to /inventory.html now redirects to login: the session was cleared
    await inventoryPage.goto();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
