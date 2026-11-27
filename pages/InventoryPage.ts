import type { Locator, Page } from '@playwright/test';
import type { Product } from './products';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortDropdown: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** The product card containing this product. */
  card(product: Product): Locator {
    return this.items.filter({ hasText: product.name });
  }

  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async addToCart(...products: Product[]) {
    for (const p of products) await this.addToCartButton(p).click();
  }

  async remove(...products: Product[]) {
    for (const p of products) await this.removeButton(p).click();
  }

  /** The name link (not the image) that opens the product's detail page. */
  nameLink(product: Product): Locator {
    return this.card(product)
      .getByRole('button', { name: `View details for ${product.name}` })
      .filter({ hasNot: this.page.locator('img') });
  }

  /** The image link that opens the product's detail page. */
  imageLink(product: Product): Locator {
    return this.card(product)
      .getByRole('button', { name: `View details for ${product.name}` })
      .filter({ has: this.page.locator('img') });
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  async prices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }
}
