// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack } = PRODUCTS;

test.describe('Reset App State', () => {
  test('Reset App State clears the cart after items have been added', async ({ page, header, inventoryPage, cartPage }) => {
    await inventoryPage.goto();

    // Add the Backpack: badge '1', button reads 'Remove'
    await inventoryPage.addToCart(backpack);
    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack)).toHaveText('Remove');

    // Reset App State: the cart empties immediately
    await header.resetAppState();
    await expect(header.cartLink).toHaveAccessibleName('Cart, empty');

    // The cart page has no line items
    await header.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(0);

    // A fresh load of the inventory page is needed for its buttons to revert to 'Add to cart'
    await inventoryPage.goto();
    await expect(inventoryPage.addToCartButton(backpack)).toHaveText('Add to cart');
    await expect(inventoryPage.items).toHaveCount(6);
    const itemCount = await inventoryPage.items.count();
    for (let i = 0; i < itemCount; i++) {
      await expect(inventoryPage.items.nth(i).getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
    await expect(header.cartLink).toHaveAccessibleName('Cart, empty');
    await expect(header.cartBadge).toHaveCount(0);
  });
});
