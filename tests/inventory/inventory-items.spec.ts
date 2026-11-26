// spec: specs/login-and-inventory.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

test.describe('Inventory Page', () => {
  test('Inventory page lists exactly 6 items, each with name, price, and its own Add to cart button', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();

    // 1. URL /inventory.html and the 'Products' header
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toBeVisible();
    await expect(inventoryPage.title).toHaveText('Products');

    // 2. Exactly 6 product cards
    await expect(inventoryPage.items).toHaveCount(6);

    // 3. Each card: a non-empty name, a price like $9.99, and exactly one 'Add to cart' button
    const itemCount = await inventoryPage.items.count();
    for (let i = 0; i < itemCount; i++) {
      const item = inventoryPage.items.nth(i);
      const name = item.locator('.inventory_item_name');
      await expect(name).toBeVisible();
      await expect(name).not.toHaveText('');
      const price = item.locator('.inventory_item_price');
      await expect(price).toBeVisible();
      await expect(price).toHaveText(/^\$\d+\.\d{2}$/);
      const addToCart = item.getByRole('button', { name: 'Add to cart' });
      await expect(addToCart).toHaveCount(1);
      await expect(addToCart).toBeVisible();
    }

    // 4. All 6 expected products, each exactly once
    const expectedNames = Object.values(PRODUCTS).map((p) => p.name);
    const actualNames = await inventoryPage.itemNames.allTextContents();
    expect(actualNames.slice().sort()).toEqual(expectedNames.slice().sort());
  });
});
