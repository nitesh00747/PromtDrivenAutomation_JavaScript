// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cart Page', () => {
  test('Cart page shows exactly the items added, each with correct name, price and quantity', async ({ page }) => {
    // 0. Seed: log in as standard_user (performed inline).
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');

    // 1. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart from the inventory page - expect badge shows '2'.
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    const badge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(badge).toHaveText('2');

    // 2. Click the cart icon to navigate to the cart page - expect URL is /cart.html and header text 'Your Cart' is visible.
    await page.click('[data-test="shopping-cart-link"]');
    await expect(page).toHaveURL(/cart\.html/);
    const header = page.locator('[data-test="title"]');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Your Cart');

    // 3. Inspect the .cart_item line items - expect exactly 2 are present; one shows quantity '1', name 'Sauce Labs Backpack', price '$29.99'; the other shows quantity '1', name 'Sauce Labs Bike Light', price '$9.99'.
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackItem).toHaveCount(1);
    await expect(backpackItem.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(backpackItem.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(backpackItem.locator('.inventory_item_price')).toHaveText('$29.99');

    const bikeLightItem = cartItems.filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(bikeLightItem).toHaveCount(1);
    await expect(bikeLightItem.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(bikeLightItem.locator('.inventory_item_name')).toHaveText('Sauce Labs Bike Light');
    await expect(bikeLightItem.locator('.inventory_item_price')).toHaveText('$9.99');

    // 4. 'Continue Shopping' and 'Checkout' buttons are both visible below the list.
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
  });

  test('Removing an item from the cart page itself updates the page and the badge', async ({ page }) => {
    // 0. Seed: log in as standard_user (performed inline).
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');

    // 1. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart, then navigate to the cart page - expect two line items visible, badge shows '2'.
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    const badge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(badge).toHaveText('2');
    await page.click('[data-test="shopping-cart-link"]');
    await expect(page).toHaveURL(/cart\.html/);
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    // 2. Click the 'Remove' button on the Backpack line item - expect the Backpack line item disappears, only Bike Light's line item remains, and the cart badge updates to '1'.
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await expect(cartItems).toHaveCount(1);
    await expect(cartItems.first()).toContainText('Sauce Labs Bike Light');
    await expect(badge).toHaveText('1');

    // 3. Click the 'Remove' button on the remaining Bike Light line item - expect the cart list becomes empty (no .cart_item elements), the cart badge disappears entirely and the cart icon's accessible name is 'Cart, empty', and 'Continue Shopping'/'Checkout' buttons remain visible.
    await page.click('[data-test="remove-sauce-labs-bike-light"]');
    await expect(cartItems).toHaveCount(0);
    await expect(badge).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
  });
});
