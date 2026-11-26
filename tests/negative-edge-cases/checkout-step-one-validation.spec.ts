// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Checkout Step One Validation Errors', () => {
  test('Continue with empty First Name shows required error and does not proceed', async ({ page }) => {
    // Perform the seed login steps
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Click 'Add to cart' on Sauce Labs Backpack - expect cart badge shows '1'
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Click the cart icon to go to /cart.html
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html/);

    // Click 'Checkout' - expect URL /checkout-step-one.html, heading 'Checkout: Your Information'
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');

    // Leave all three fields empty and click Continue - expect page remains on step one with required First Name error
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    const errorAlert = page.locator('h3[data-test="error"]');
    await expect(errorAlert).toHaveText('Error: First Name is required');
    await expect(page.locator('[data-test="firstName"]')).toHaveClass(/input_error/);
  });

  test('Continue with First Name filled but empty Last Name shows required error and does not proceed', async ({ page }) => {
    // Perform the seed login steps
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Add any product to cart, open cart, click Checkout to reach /checkout-step-one.html
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // Fill First Name with 'John'. Leave Last Name and Zip/Postal Code empty.
    const firstNameInput = page.locator('[data-test="firstName"]');
    await firstNameInput.fill('John');

    // Click Continue - expect page remains on step one with required Last Name error, First Name value retained
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('h3[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(firstNameInput).toHaveValue('John');
  });

  test('Continue with First and Last Name filled but empty Zip/Postal Code shows required error and does not proceed', async ({ page }) => {
    // Perform the seed login steps
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Add any product to cart, open cart, click Checkout to reach /checkout-step-one.html
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // Fill First Name 'John' and Last Name 'Doe'. Leave Zip/Postal Code empty.
    const firstNameInput = page.locator('[data-test="firstName"]');
    const lastNameInput = page.locator('[data-test="lastName"]');
    await firstNameInput.fill('John');
    await lastNameInput.fill('Doe');

    // Click Continue - expect page remains on step one with required Postal Code error, First/Last Name values retained
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('h3[data-test="error"]')).toHaveText('Error: Postal Code is required');
    await expect(firstNameInput).toHaveValue('John');
    await expect(lastNameInput).toHaveValue('Doe');
  });

  test('Filling all three required fields allows successful progression to step two', async ({ page }) => {
    // Perform the seed login steps
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Add any product to cart, open cart, click Checkout to reach /checkout-step-one.html
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // Fill First Name 'John', Last Name 'Doe', Zip/Postal Code '12345'
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Click Continue - expect navigation to step two with no error alert
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
    await expect(page.locator('h3[data-test="error"]')).toHaveCount(0);
  });
});
