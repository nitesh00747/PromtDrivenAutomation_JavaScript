// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Checkout Cancel Flows', () => {
  test('Cancel on checkout step one returns to the cart page with cart contents preserved', async ({ page }) => {
    // Navigate to '/', fill username, fill password, click login button
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // Add the Sauce Labs Backpack to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // expect: Cart badge shows '1'
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // Open the cart and click 'Checkout' to reach /checkout-step-one.html
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    // expect: Page shows heading 'Checkout: Your Information'
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');

    // Without filling any fields, click 'Cancel'
    await page.locator('[data-test="cancel"]').click();

    // expect: Page navigates to /cart.html (NOT /checkout-step-two.html and NOT /inventory.html)
    await expect(page).toHaveURL(/\/cart\.html$/);

    // expect: The cart still shows 1 item: 'Sauce Labs Backpack' with its Remove button present
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // expect: Cart badge in the header still shows '1'
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Cancel on checkout overview (step two) returns to the inventory page with cart contents preserved', async ({ page }) => {
    // Navigate to '/', fill username, fill password, click login button
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // Add the Sauce Labs Backpack to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // expect: Cart badge shows '1'
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // Open the cart and click 'Checkout'
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // On /checkout-step-one.html, fill First Name 'John', Last Name 'Doe', Zip/Postal Code '12345', then click Continue
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // expect: Page navigates to /checkout-step-two.html showing 'Checkout: Overview' with the item total, tax, and grand total displayed
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
    await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();
    await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();

    // Click the 'Cancel' button on the overview page
    await page.locator('[data-test="cancel"]').click();

    // expect: Page navigates to /inventory.html (NOT back to /cart.html and NOT /checkout-step-one.html)
    await expect(page).toHaveURL(/\/inventory\.html$/);

    // expect: Cart badge in the header still shows '1'
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // Navigating to /cart.html afterward confirms the 'Sauce Labs Backpack' line item is still present with its 'Remove' button
    await page.goto('/cart.html');
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });
});
