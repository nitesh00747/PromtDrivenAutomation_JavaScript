// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Product Sorting', () => {
  test('Default sort is Name (A to Z) and can be re-selected explicitly', async ({ page }) => {
    // Log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Expect the sort dropdown shows 'Name (A to Z)' selected by default
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await expect(sortDropdown).toHaveValue('az');

    // Read product names in page order - expect exactly the default alphabetical order
    const expectedAscNames = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ];
    const productNames = page.locator('.inventory_item_name');
    await expect(productNames).toHaveText(expectedAscNames);

    // Explicitly select 'az' from the dropdown - expect the same order unchanged
    await sortDropdown.selectOption('az');
    await expect(sortDropdown).toHaveValue('az');
    await expect(productNames).toHaveText(expectedAscNames);
  });

  test('Sorting by Name (Z to A) reverses the alphabetical order', async ({ page }) => {
    // Log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Select 'za' from the dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('za');

    // Expect dropdown shows 'Name (Z to A)' selected
    await expect(sortDropdown).toHaveValue('za');

    // Expect product order is exactly reversed alphabetical order
    const expectedDescNames = [
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
    ];
    const productNames = page.locator('.inventory_item_name');
    await expect(productNames).toHaveText(expectedDescNames);
  });

  test('Sorting by Price (low to high) orders items ascending by price', async ({ page }) => {
    // Log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Select 'lohi' from the dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('lohi');

    // Expect dropdown shows 'Price (low to high)' selected
    await expect(sortDropdown).toHaveValue('lohi');

    // Expect product order is exactly ascending by price
    const expectedNames = [
      'Sauce Labs Onesie',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket',
    ];
    const productNames = page.locator('.inventory_item_name');
    await expect(productNames).toHaveText(expectedNames);

    // Verify each item's displayed price is non-decreasing from top to bottom
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));
    const sortedAscending = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedAscending);
  });

  test('Sorting by Price (high to low) orders items descending by price', async ({ page }) => {
    // Log in as standard_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Select 'hilo' from the dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('hilo');

    // Expect dropdown shows 'Price (high to low)' selected
    await expect(sortDropdown).toHaveValue('hilo');

    // Expect product order is exactly descending by price
    const expectedNames = [
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Backpack',
      'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Bike Light',
      'Sauce Labs Onesie',
    ];
    const productNames = page.locator('.inventory_item_name');
    await expect(productNames).toHaveText(expectedNames);

    // Verify prices are non-increasing top to bottom
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));
    const sortedDescending = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedDescending);
  });
});
