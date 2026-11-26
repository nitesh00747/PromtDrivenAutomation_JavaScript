import type { Locator, Page } from '@playwright/test';
import type { Product } from './products';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.locator('.cart_item');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  item(product: Product): Locator {
    return this.items.filter({ hasText: product.name });
  }

  itemQuantity(item: Locator): Locator {
    return item.getByTestId('item-quantity');
  }

  itemName(item: Locator): Locator {
    return item.locator('.inventory_item_name');
  }

  itemPrice(item: Locator): Locator {
    return item.locator('.inventory_item_price');
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
