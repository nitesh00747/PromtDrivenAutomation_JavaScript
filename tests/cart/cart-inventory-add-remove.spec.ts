// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack, bikeLight, boltTShirt } = PRODUCTS;

test.describe('Cart - Inventory Page Interactions', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('Adding a single item updates the cart badge and button', async ({ header, inventoryPage }) => {
    // Cart starts empty: accessible name 'Cart, empty' and no badge
    await expect(header.cartLink).toHaveAccessibleName('Cart, empty');
    await expect(header.cartBadge).toHaveCount(0);

    // Add the Backpack: its button reads 'Remove', badge shows '1', cart name is 'Cart, 1 items'
    await inventoryPage.addToCart(backpack);
    await expect(inventoryPage.removeButton(backpack)).toHaveText('Remove');
    await expect(header.cartBadge).toHaveText('1');
    await expect(header.cartLink).toHaveAccessibleName('Cart, 1 items');
  });

  test('Adding multiple items increments the badge correctly', async ({ header, inventoryPage }) => {
    await expect(header.cartLink).toHaveAccessibleName('Cart, empty');

    await inventoryPage.addToCart(backpack);
    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack)).toHaveText('Remove');

    await inventoryPage.addToCart(bikeLight);
    await expect(header.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(bikeLight)).toHaveText('Remove');
    await expect(inventoryPage.removeButton(backpack)).toHaveText('Remove');

    await inventoryPage.addToCart(boltTShirt);
    await expect(header.cartBadge).toHaveText('3');
    for (const p of [backpack, bikeLight, boltTShirt]) {
      await expect(inventoryPage.removeButton(p)).toHaveText('Remove');
    }
  });

  test('Removing an item via its inventory page Remove button decrements the badge and reverts the button', async ({ header, inventoryPage }) => {
    await inventoryPage.addToCart(backpack, bikeLight);
    await expect(header.cartBadge).toHaveText('2');

    // Remove the Bike Light: badge '1', its button reverts, Backpack still 'Remove'
    await inventoryPage.remove(bikeLight);
    await expect(header.cartBadge).toHaveText('1');
    await expect(inventoryPage.addToCartButton(bikeLight)).toHaveText('Add to cart');
    await expect(inventoryPage.removeButton(backpack)).toHaveText('Remove');

    // Remove the Backpack: cart empty, no badge, button reverts
    await inventoryPage.remove(backpack);
    await expect(header.cartLink).toHaveAccessibleName('Cart, empty');
    await expect(header.cartBadge).toHaveCount(0);
    await expect(inventoryPage.addToCartButton(backpack)).toHaveText('Add to cart');
  });
});
