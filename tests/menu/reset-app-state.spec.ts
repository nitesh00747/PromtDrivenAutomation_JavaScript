// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Reset App State', () => {
  test('Reset App State clears the cart after items have been added', async ({ page }) => {
    // Perform seed login steps inline
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const cartLink = page.locator('[data-test="shopping-cart-link"]');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // Add Sauce Labs Backpack to the cart - expect cart badge shows '1' and the Backpack button reads 'Remove'
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(cartBadge).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');

    // Open the burger menu and click 'Reset App State' - expect the cart badge disappears immediately
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="reset-sidebar-link"]').click();
    await expect(cartLink).toHaveAccessibleName('Cart, empty');

    // Navigate to the cart page - expect the cart page shows no .cart_item line items
    await cartLink.click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(0);

    // Navigate back to /inventory.html via a fresh navigation (a real reload is required for the
    // inventory page's own 'Remove' buttons to visually revert to 'Add to cart')
    await page.goto('/inventory.html');

    // Expect the Sauce Labs Backpack button has reverted to 'Add to cart', all other product
    // buttons also read 'Add to cart', and the cart badge remains absent
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toHaveText('Add to cart');
    const inventoryItems = page.locator('.inventory_item');
    await expect(inventoryItems).toHaveCount(6);
    const itemCount = await inventoryItems.count();
    for (let i = 0; i < itemCount; i++) {
      await expect(inventoryItems.nth(i).getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
    await expect(cartLink).toHaveAccessibleName('Cart, empty');
    await expect(cartBadge).toHaveCount(0);
  });
});
