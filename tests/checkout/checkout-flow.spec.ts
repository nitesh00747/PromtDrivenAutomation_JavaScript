// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack, bikeLight } = PRODUCTS;

test.describe('Checkout Flow (End to End)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('Complete the checkout happy path with a single item', async ({ page, header, inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(backpack);

    // Cart has 1 line item: the Backpack
    await header.openCart();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemName(cartPage.items.first())).toHaveText(backpack.name);

    // Step one
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');

    // Step two
    await checkoutPage.fillInformation({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');

    // Overview: 1 item, payment/shipping info and totals
    await expect(checkoutPage.items).toHaveCount(1);
    const item = checkoutPage.items.first();
    await expect(item.getByTestId('item-quantity')).toHaveText('1');
    await expect(item.locator('.inventory_item_name')).toHaveText(backpack.name);
    await expect(item.locator('.inventory_item_price')).toHaveText(backpack.price);
    await expect(checkoutPage.paymentInfo).toHaveText('SauceCard #31337');
    await expect(checkoutPage.shippingInfo).toHaveText('Free Pony Express Delivery!');
    await expect(checkoutPage.subtotal).toHaveText('Item total: $29.99');
    await expect(checkoutPage.tax).toHaveText('Tax: $2.40');
    await expect(checkoutPage.total).toHaveText('Total: $32.39');

    // Finish
    await checkoutPage.finishButton.click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Complete!');
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.completeText).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
    await expect(checkoutPage.backHomeButton).toBeVisible();

    // Back Home: inventory, cart empty
    await checkoutPage.backHomeButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(header.cartButton('Cart, empty')).toBeVisible();
  });

  test('Complete the checkout happy path with multiple items and verify correct price totals', async ({ page, header, inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(backpack, bikeLight);

    await header.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillInformation({ firstName: 'Jane', lastName: 'Smith', postalCode: '54321' });
    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');

    // Overview: 2 items, quantity 1 each, right names and prices, correct totals
    await expect(checkoutPage.items).toHaveCount(2);
    await expect(checkoutPage.items.getByTestId('item-quantity')).toHaveText(['1', '1']);
    const names = await checkoutPage.items.locator('.inventory_item_name').allTextContents();
    expect(names.slice().sort()).toEqual([backpack.name, bikeLight.name].sort());
    const prices = await checkoutPage.items.locator('.inventory_item_price').allTextContents();
    expect(prices.slice().sort()).toEqual([backpack.price, bikeLight.price].sort());
    await expect(checkoutPage.subtotal).toHaveText('Item total: $39.98');
    await expect(checkoutPage.tax).toHaveText('Tax: $3.20');
    await expect(checkoutPage.total).toHaveText('Total: $43.18');

    await checkoutPage.finishButton.click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');

    await checkoutPage.backHomeButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(header.cartButton('Cart, empty')).toBeVisible();
  });
});
