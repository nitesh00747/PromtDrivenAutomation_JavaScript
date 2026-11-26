import { test as base, expect } from '@playwright/test';
import { CartPage, CheckoutPage, Header, InventoryPage, LoginPage, ProductDetailPage } from '../pages';

type Pages = {
  loginPage: LoginPage;
  header: Header;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  productPage: ProductDetailPage;
};

/**
 * Import `test` and `expect` from here, not from '@playwright/test'.
 * Tests get page objects as fixtures and start already logged in as standard_user
 * (the `setup` project saves the session). For a logged-out start:
 *   test.use({ storageState: NO_AUTH })   // from test-data/users
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  productPage: async ({ page }, use) => use(new ProductDetailPage(page)),
});

export { expect };
