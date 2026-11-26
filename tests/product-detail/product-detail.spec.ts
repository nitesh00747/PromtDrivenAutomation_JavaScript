// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack, bikeLight } = PRODUCTS;
const BACKPACK_DESCRIPTION =
  'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.';
const BIKE_LIGHT_DESCRIPTION =
  "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.";

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("Clicking a product's name navigates to its detail page with matching content, and Back to products returns to inventory", async ({ page, inventoryPage, productPage }) => {
    // The Backpack card shows its name, description and price
    const card = inventoryPage.card(backpack);
    await expect(card.locator('.inventory_item_name')).toHaveText(backpack.name);
    await expect(card.getByText(BACKPACK_DESCRIPTION, { exact: true })).toBeVisible();
    await expect(card.locator('.inventory_item_price')).toHaveText(backpack.price);

    // Click the name: the detail page shows the same content, the image and the buttons
    await inventoryPage.nameLink(backpack).click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(productPage.text(backpack.name)).toBeVisible();
    await expect(productPage.text(BACKPACK_DESCRIPTION)).toBeVisible();
    await expect(productPage.text(backpack.price)).toBeVisible();
    await expect(productPage.image(backpack.name)).toBeVisible();
    await expect(productPage.addToCartButton).toBeVisible();
    await expect(productPage.backToProductsButton).toBeVisible();

    // Back to products: the full 6-item list again
    await productPage.backToProductsButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test("Clicking a product's image navigates to its detail page, and Add to cart works from that page", async ({ page, header, inventoryPage, productPage }) => {
    await expect(header.cartButton('Cart, empty')).toBeVisible();

    // Click the Bike Light image: detail page with name, description, price, image and 'Add to cart'
    await inventoryPage.imageLink(bikeLight).click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(productPage.text(bikeLight.name)).toBeVisible();
    await expect(productPage.text(BIKE_LIGHT_DESCRIPTION)).toBeVisible();
    await expect(productPage.text(bikeLight.price)).toBeVisible();
    await expect(productPage.image(bikeLight.name)).toBeVisible();
    await expect(productPage.addToCartButton).toBeVisible();

    // Add to cart: the button becomes 'Remove', badge '1'
    await productPage.addToCartButton.click();
    await expect(productPage.removeButton).toBeVisible();
    await expect(productPage.removeButton).toHaveText('Remove');
    await expect(header.cartBadge).toHaveText('1');

    // Back to products: the Bike Light card shows 'Remove', badge still '1'
    await productPage.backToProductsButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.removeButton(bikeLight)).toBeVisible();
    await expect(header.cartBadge).toHaveText('1');
  });
});
