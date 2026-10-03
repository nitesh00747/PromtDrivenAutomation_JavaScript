// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cart - Inventory Page Interactions', () => {
  test('Adding a single item updates the cart badge and button', async ({ page }) => {
    // Perform seed login steps inline
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const cartLink = page.locator('[data-test="shopping-cart-link"]');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // After logging in, expect the cart icon has accessible name 'Cart, empty' and no shopping-cart-badge element is present
    await expect(cartLink).toHaveAccessibleName('Cart, empty');
    await expect(cartBadge).toHaveCount(0);

    // Click 'Add to cart' for Sauce Labs Backpack
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Expect: the button's visible text changes to 'Remove'; the cart badge appears showing '1'; the cart icon's accessible name becomes 'Cart, 1 items'
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');
    await expect(cartBadge).toHaveText('1');
    await expect(cartLink).toHaveAccessibleName('Cart, 1 items');
  });

  test('Adding multiple items increments the badge correctly', async ({ page }) => {
    // Perform seed login steps inline
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const cartLink = page.locator('[data-test="shopping-cart-link"]');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // After logging in, expect cart icon shows 'Cart, empty'
    await expect(cartLink).toHaveAccessibleName('Cart, empty');

    // Click 'Add to cart' for Sauce Labs Backpack
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Expect badge shows '1', button reads 'Remove'
    await expect(cartBadge).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');

    // Click 'Add to cart' for Sauce Labs Bike Light
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Expect badge updates to '2', bike light button reads 'Remove', backpack button still reads 'Remove'
    await expect(cartBadge).toHaveText('2');
    await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toHaveText('Remove');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');

    // Click 'Add to cart' for Sauce Labs Bolt T-Shirt
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

    // Expect badge updates to '3', all three buttons read 'Remove'
    await expect(cartBadge).toHaveText('3');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');
    await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toHaveText('Remove');
    await expect(page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]')).toHaveText('Remove');
  });

  test('Removing an item via its inventory page Remove button decrements the badge and reverts the button', async ({ page }) => {
    // Perform seed login steps inline
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const cartLink = page.locator('[data-test="shopping-cart-link"]');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // After logging in, add Sauce Labs Backpack and Sauce Labs Bike Light to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Expect badge shows '2'
    await expect(cartBadge).toHaveText('2');

    // Click the 'Remove' button for Sauce Labs Bike Light
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();

    // Expect badge decrements to '1', bike light button reverts to 'Add to cart', backpack button still reads 'Remove'
    await expect(cartBadge).toHaveText('1');
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')).toHaveText('Add to cart');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toHaveText('Remove');

    // Click the 'Remove' button for Sauce Labs Backpack
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Expect cart icon reverts to accessible name 'Cart, empty' with no badge element present, and backpack button reverts to 'Add to cart'
    await expect(cartLink).toHaveAccessibleName('Cart, empty');
    await expect(cartBadge).toHaveCount(0);
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toHaveText('Add to cart');
  });
});
