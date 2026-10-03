// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Inventory Page', () => {
  test('Inventory page lists exactly 6 items, each with name, price, and its own Add to cart button', async ({ page }) => {
    // 0. Seed: log in as standard_user to reach the inventory page.
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // 1. Expect page URL matches /inventory.html and the 'Products' header is visible.
    await expect(page).toHaveURL(/inventory\.html/);
    const header = page.locator('[data-test="title"]');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Products');

    // 2. Locate all product item containers on the page (class `inventory_item`) and expect exactly 6 are found.
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);

    // 3. For each item container, verify a visible non-empty name, a visible price matching currency format, and exactly one visible 'Add to cart' button.
    const priceFormat = /^\$\d+\.\d{2}$/;
    const itemCount = await items.count();
    for (let i = 0; i < itemCount; i++) {
      const item = items.nth(i);

      const name = item.locator('.inventory_item_name');
      await expect(name).toBeVisible();
      await expect(name).not.toHaveText('');

      const price = item.locator('.inventory_item_price');
      await expect(price).toBeVisible();
      await expect(price).toHaveText(priceFormat);

      const addToCartButton = item.getByRole('button', { name: 'Add to cart' });
      await expect(addToCartButton).toHaveCount(1);
      await expect(addToCartButton).toBeVisible();
    }

    // 4. Verify the full set of 6 expected product names are all present on the page, each exactly once.
    const expectedNames = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ];
    const actualNames = await page.locator('.inventory_item_name').allTextContents();
    expect(actualNames.slice().sort()).toEqual(expectedNames.slice().sort());
  });
});
