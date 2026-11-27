// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack, bikeLight } = PRODUCTS;

test.describe('Cart Page', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('Cart page shows exactly the items added, each with correct name, price and quantity', async ({ page, header, inventoryPage, cartPage }) => {
    // 1. Add Backpack and Bike Light - badge shows '2'
    await inventoryPage.addToCart(backpack, bikeLight);
    await expect(header.cartBadge).toHaveText('2');

    // 2. Open the cart - URL /cart.html, header 'Your Cart'
    await header.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.title).toBeVisible();
    await expect(cartPage.title).toHaveText('Your Cart');

    // 3. Exactly 2 line items, each with quantity 1 and the right name and price
    await expect(cartPage.items).toHaveCount(2);
    for (const p of [backpack, bikeLight]) {
      const item = cartPage.item(p);
      await expect(item).toHaveCount(1);
      await expect(cartPage.itemQuantity(item)).toHaveText('1');
      await expect(cartPage.itemName(item)).toHaveText(p.name);
      await expect(cartPage.itemPrice(item)).toHaveText(p.price);
    }

    // 4. 'Continue Shopping' and 'Checkout' are visible
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('Removing an item from the cart page itself updates the page and the badge', async ({ page, header, inventoryPage, cartPage }) => {
    // 1. Add two items and open the cart
    await inventoryPage.addToCart(backpack, bikeLight);
    await expect(header.cartBadge).toHaveText('2');
    await header.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(2);

    // 2. Remove the Backpack - only the Bike Light remains, badge '1'
    await cartPage.removeButton(backpack).click();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.items.first()).toContainText(bikeLight.name);
    await expect(header.cartBadge).toHaveText('1');

    // 3. Remove the Bike Light - list empty, no badge, 'Cart, empty', buttons still visible
    await cartPage.removeButton(bikeLight).click();
    await expect(cartPage.items).toHaveCount(0);
    await expect(header.cartBadge).toHaveCount(0);
    await expect(header.cartButton('Cart, empty')).toBeVisible();
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });
});
