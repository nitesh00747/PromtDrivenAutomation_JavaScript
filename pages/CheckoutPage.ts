import type { Locator, Page } from '@playwright/test';
import { CHECKOUT_INFO } from '../test-data/users';

/** All three checkout steps: your information, overview, complete. */
export class CheckoutPage {
  readonly title: Locator;
  // Step one: your information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  // Step two: overview
  readonly items: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // Complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.items = page.locator('.cart_item');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  /** Fill step one. Pass only the fields you want filled (validation tests leave some empty). */
  async fillInformation(info: Partial<{ firstName: string; lastName: string; postalCode: string }> = CHECKOUT_INFO) {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }
}
