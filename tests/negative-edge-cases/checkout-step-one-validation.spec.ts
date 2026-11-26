// spec: specs/negative-edge-cases.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

test.describe('Checkout Step One Validation Errors', () => {
  // Add a product, open the cart and go to checkout step one
  test.beforeEach(async ({ page, header, inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await expect(header.cartBadge).toHaveText('1');
    await header.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('Continue with empty First Name shows required error and does not proceed', async ({ page, checkoutPage }) => {
    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');

    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.error).toHaveText('Error: First Name is required');
    await expect(checkoutPage.firstName).toHaveClass(/input_error/);
  });

  test('Continue with First Name filled but empty Last Name shows required error and does not proceed', async ({ page, checkoutPage }) => {
    await checkoutPage.fillInformation({ firstName: 'John' });

    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.error).toHaveText('Error: Last Name is required');
    await expect(checkoutPage.firstName).toHaveValue('John');
  });

  test('Continue with First and Last Name filled but empty Zip/Postal Code shows required error and does not proceed', async ({ page, checkoutPage }) => {
    await checkoutPage.fillInformation({ firstName: 'John', lastName: 'Doe' });

    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.error).toHaveText('Error: Postal Code is required');
    await expect(checkoutPage.firstName).toHaveValue('John');
    await expect(checkoutPage.lastName).toHaveValue('Doe');
  });

  test('Filling all three required fields allows successful progression to step two', async ({ page, checkoutPage }) => {
    await checkoutPage.fillInformation({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutPage.error).toHaveCount(0);
  });
});
