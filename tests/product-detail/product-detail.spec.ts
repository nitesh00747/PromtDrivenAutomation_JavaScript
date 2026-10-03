// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test("Clicking a product's name navigates to its detail page with matching content, and Back to products returns to inventory", async ({ page }) => {
    // Seed: navigate to '/' and log in as standard_user.
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // After logging in, note the inventory card for Sauce Labs Backpack shows name 'Sauce Labs Backpack', a description, and price '$29.99'.
    const backpackDescription =
      "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.";
    const backpackCard = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackCard.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(backpackCard.getByText(backpackDescription, { exact: true })).toBeVisible();
    await expect(backpackCard.locator('.inventory_item_price')).toHaveText('$29.99');

    // Click the product name link with accessible name 'View details for Sauce Labs Backpack'.
    const backpackNameLink = backpackCard
      .getByRole('button', { name: 'View details for Sauce Labs Backpack' })
      .filter({ hasNot: page.locator('img') });
    await backpackNameLink.click();

    // Expect URL matches /inventory-item.html?id=<id>, the same name/description/price are shown on the detail page,
    // the product image is visible, an 'Add to cart' button is visible, and a 'Back to products' button is visible.
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
    await expect(page.getByText(backpackDescription, { exact: true })).toBeVisible();
    await expect(page.getByText('$29.99', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(page.locator('[data-test="add-to-cart"]')).toBeVisible();
    const backToProductsButton = page.locator('[data-test="back-to-products"]');
    await expect(backToProductsButton).toBeVisible();

    // Click 'Back to products'.
    await backToProductsButton.click();

    // Expect URL returns to /inventory.html and the full 6-item inventory list is visible again.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test("Clicking a product's image navigates to its detail page, and Add to cart works from that page", async ({ page }) => {
    // Seed: navigate to '/' and log in as standard_user.
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // After logging in, expect cart is empty ('Cart, empty').
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    // Click the product image with accessible name 'View details for Sauce Labs Bike Light'.
    const bikeLightDescription =
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.";
    const bikeLightCard = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Bike Light' });
    const bikeLightImageLink = bikeLightCard
      .getByRole('button', { name: 'View details for Sauce Labs Bike Light' })
      .filter({ has: page.locator('img') });
    await bikeLightImageLink.click();

    // Expect URL matches /inventory-item.html?id=<id>, name 'Sauce Labs Bike Light', description, price '$9.99',
    // and image are shown, and an 'Add to cart' button is visible.
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(page.getByText('Sauce Labs Bike Light', { exact: true })).toBeVisible();
    await expect(page.getByText(bikeLightDescription, { exact: true })).toBeVisible();
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Sauce Labs Bike Light' })).toBeVisible();
    const addToCartButton = page.locator('[data-test="add-to-cart"]');
    await expect(addToCartButton).toBeVisible();

    // Click the 'Add to cart' button on the detail page.
    await addToCartButton.click();

    // Expect its text changes to 'Remove' and the cart badge appears showing '1'.
    const removeButton = page.locator('[data-test="remove"]');
    await expect(removeButton).toBeVisible();
    await expect(removeButton).toHaveText('Remove');
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText('1');

    // Click 'Back to products'.
    await page.locator('[data-test="back-to-products"]').click();

    // Expect URL returns to /inventory.html, the Sauce Labs Bike Light card on the inventory page shows a 'Remove' button,
    // and the cart badge still shows '1'.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toBeVisible();
    await expect(cartBadge).toHaveText('1');
  });
});
