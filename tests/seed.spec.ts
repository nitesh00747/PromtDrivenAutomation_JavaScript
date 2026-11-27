import { test, expect } from '../fixtures';

// Seed for the Planner and Generator: every logged-in scenario starts here, on the inventory
// page as standard_user. The login itself is done once by tests/auth.setup.ts.
test.describe('Seed', () => {
  test('Logged in as standard_user', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
