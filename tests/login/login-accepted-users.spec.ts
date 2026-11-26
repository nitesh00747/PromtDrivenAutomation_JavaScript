// spec: specs/login-and-inventory.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { NO_AUTH, USERS } from '../../test-data/users';

test.describe('Login - Accepted Users', () => {
  // Login tests start logged out.
  test.use({ storageState: NO_AUTH });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard_user logs in successfully', async ({ page, loginPage, inventoryPage }) => {
    await expect(loginPage.form).toBeVisible();
    await loginPage.login(USERS.standard);
    await expect(loginPage.error).not.toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // The other accepted users: no error, lands on the inventory page.
  const others: [string, string, number?][] = [
    ['problem_user', USERS.problem],
    // simulates a slow login before navigating, so allow a generous timeout
    ['performance_glitch_user', USERS.performanceGlitch, 15_000],
    ['error_user', USERS.error],
    ['visual_user', USERS.visual],
  ];
  for (const [label, user, timeout] of others) {
    test(`${label} logs in successfully`, async ({ page, loginPage }) => {
      await loginPage.login(user);
      await expect(loginPage.error).not.toBeVisible();
      await expect(page).toHaveURL(/inventory\.html/, timeout ? { timeout } : undefined);
    });
  }
});
