import type { Locator, Page } from '@playwright/test';

export class ProductDetailPage {
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(readonly page: Page) {
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  /** Exact visible text on the detail page (name, description or price). */
  text(value: string): Locator {
    return this.page.getByText(value, { exact: true });
  }

  image(productName: string): Locator {
    return this.page.getByRole('img', { name: productName });
  }
}
