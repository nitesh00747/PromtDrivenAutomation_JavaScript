import { test, expect } from '@playwright/test';

test.describe('Seed', () => {
  test('Logged in as standard_user', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
