import { test, expect } from '@playwright/test';

test.describe('Seed', () => {
  test('Started a Florida renters insurance quote', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Accept All' }).click();

    const addressInput = page.locator('#address');
    await addressInput.click({ force: true });
    await addressInput.fill('400 S Dixie Hwy, Miami, FL');
    await page.getByRole('option', { name: /Miami, FL/ }).first().click();

    // The address autocomplete selection is async (Angular form state updates a moment after
    // the click) - "GET A QUOTE" silently no-ops or bounces back to '/' if clicked before the
    // resolved address (with ZIP) has actually landed in the input's value.
    await expect(addressInput).toHaveValue(/\d{5}/);

    await page.getByRole('button', { name: 'GET A QUOTE' }).first().click();

    await expect(page).toHaveURL(/\/sale\/questions/);
  });
});
