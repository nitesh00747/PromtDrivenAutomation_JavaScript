// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Checkout Flow (End to End)', () => {
  test('Complete the checkout happy path with a single item', async ({ page }) => {
    // Seed: log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Add Sauce Labs Backpack ($29.99) to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Navigate to the cart page - expect 1 line item for Sauce Labs Backpack
    await page.locator('[data-test="shopping-cart-link"]').click();
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    await expect(cartItems.first().locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');

    // Click 'Checkout' - expect URL /checkout-step-one.html, header 'Checkout: Your Information'
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');

    // Fill First Name, Last Name, Zip/Postal Code, click 'Continue' - expect URL /checkout-step-two.html, header 'Checkout: Overview'
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');

    // Inspect overview - expect exactly 1 line item: Sauce Labs Backpack, quantity '1', price '$29.99'; payment/shipping info; subtotal/tax/total labels
    const overviewItems = page.locator('.cart_item');
    await expect(overviewItems).toHaveCount(1);
    const overviewItem = overviewItems.first();
    await expect(overviewItem.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(overviewItem.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(overviewItem.locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $29.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $2.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $32.39');

    // Click 'Finish' - expect URL /checkout-complete.html, header 'Checkout: Complete!', complete-header, complete-text, 'Back Home' button visible
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Complete!');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();

    // Click 'Back Home' - expect URL /inventory.html and cart icon shows 'Cart, empty'
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
  });

  test('Complete the checkout happy path with multiple items and verify correct price totals', async ({ page }) => {
    // Seed: log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99) to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Go to the cart page, click 'Checkout' - expect URL /checkout-step-one.html
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // Fill First Name, Last Name, Zip/Postal Code, click 'Continue' - expect URL /checkout-step-two.html, header 'Checkout: Overview'
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('54321');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');

    // Inspect overview - expect exactly 2 line items with quantity '1' each and prices $29.99/$9.99; subtotal/tax/total labels
    const overviewItems = page.locator('.cart_item');
    await expect(overviewItems).toHaveCount(2);
    const quantities = overviewItems.locator('[data-test="item-quantity"]');
    await expect(quantities).toHaveText(['1', '1']);
    const names = await overviewItems.locator('.inventory_item_name').allTextContents();
    expect(names.slice().sort()).toEqual(['Sauce Labs Backpack', 'Sauce Labs Bike Light'].slice().sort());
    const prices = await overviewItems.locator('.inventory_item_price').allTextContents();
    expect(prices.slice().sort()).toEqual(['$29.99', '$9.99'].slice().sort());
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.20');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $43.18');

    // Click 'Finish' - expect URL /checkout-complete.html and 'Thank you for your order!' visible
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');

    // Click 'Back Home' - expect URL /inventory.html and cart is empty ('Cart, empty')
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
  });
});
