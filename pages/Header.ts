import type { Locator, Page } from '@playwright/test';

/** Shared header: cart icon and the burger (side) menu. Present on every logged-in page. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly allItemsLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(readonly page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
  }

  /** The cart icon by accessible name, e.g. cartButton('Cart, empty') or cartButton('Cart, 1 items'). */
  cartButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  async openCart() {
    await this.cartLink.click();
  }

  async openMenu() {
    await this.menuButton.click();
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }
}
