// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack } = PRODUCTS;

test.describe('Checkout Cancel Flows', () => {
  test.beforeEach(async ({ page, header, inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.addToCart(backpack);
    await expect(header.cartBadge).toHaveText('1');
    await header.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('Cancel on checkout step one returns to the cart page with cart contents preserved', async ({ page, header, checkoutPage, cartPage }) => {
    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');

    // Cancel without filling anything: back to /cart.html (not step two, not inventory)
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    // The Backpack is still in the cart, with its Remove button; badge still '1'
    await expect(page.getByText(backpack.name)).toBeVisible();
    await expect(cartPage.removeButton(backpack)).toBeVisible();
    await expect(header.cartBadge).toHaveText('1');
  });

  test('Cancel on checkout overview (step two) returns to the inventory page with cart contents preserved', async ({ page, header, checkoutPage, cartPage }) => {
    await checkoutPage.fillInformation({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutPage.continue();

    // Overview with item total, tax and grand total
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutPage.subtotal).toBeVisible();
    await expect(checkoutPage.tax).toBeVisible();
    await expect(checkoutPage.total).toBeVisible();

    // Cancel on the overview: back to /inventory.html (not cart, not step one); badge still '1'
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toHaveText('1');

    // The cart still holds the Backpack
    await cartPage.goto();
    await expect(page.getByText(backpack.name)).toBeVisible();
    await expect(cartPage.removeButton(backpack)).toBeVisible();
  });
});
