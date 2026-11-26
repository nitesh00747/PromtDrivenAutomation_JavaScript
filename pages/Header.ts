import { expect, type Locator, type Page } from '@playwright/test';

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

  /**
   * Open the side menu and wait until it is really open.
   * WebKit occasionally drops the click on this burger button (seen in CI: the menu never opened
   * and the next click timed out after 30 s). So the click is repeated only while the menu is
   * still closed: this re-tries the action whose effect was lost, not the assertion.
   */
  async openMenu() {
    await expect(async () => {
      if (!(await this.allItemsLink.isVisible())) await this.menuButton.click();
      await expect(this.allItemsLink).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 10_000 });
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
