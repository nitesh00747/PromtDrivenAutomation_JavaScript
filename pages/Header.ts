import { expect, type Locator, type Page } from '@playwright/test';

/** Shared header: cart icon and the burger (side) menu. Present on every logged-in page. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly allItemsLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  /** The side menu's wrapper; its attributes show whether the menu is ready, open or closed. */
  readonly menuWrap: Locator;

  constructor(readonly page: Page) {
    this.menuWrap = page.locator('.bm-menu-wrap');
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
   * Open the side menu, once the menu is ready for it.
   *
   * The menu (react-burger-menu 3.x) starts a 500 ms timer when the page loads that marks its
   * wrapper `hidden`. A click before that timer fires can race with it: the menu becomes "open"
   * (aria-hidden="false") but stays hidden, so its links never appear (seen in CI on WebKit, and
   * more likely now that tests start fast from a saved login). The `hidden` attribute shows the
   * timer has run, so wait for it, click once, then wait for the menu to be open and visible.
   */
  async openMenu() {
    await expect(this.menuWrap).toHaveAttribute('hidden');
    await this.menuButton.click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
    await expect(this.allItemsLink).toBeVisible();
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
