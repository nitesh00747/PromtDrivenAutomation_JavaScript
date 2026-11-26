// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

const { backpack, bikeLight, boltTShirt, fleeceJacket, onesie, redTShirt } = PRODUCTS;
const names = (...ps: { name: string }[]) => ps.map((p) => p.name);

test.describe('Product Sorting', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('Default sort is Name (A to Z) and can be re-selected explicitly', async ({ inventoryPage }) => {
    const expectedAsc = names(backpack, bikeLight, boltTShirt, fleeceJacket, onesie, redTShirt);

    // Default: 'az', alphabetical
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.itemNames).toHaveText(expectedAsc);

    // Selecting 'az' explicitly keeps the same order
    await inventoryPage.sortBy('az');
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.itemNames).toHaveText(expectedAsc);
  });

  test('Sorting by Name (Z to A) reverses the alphabetical order', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    await expect(inventoryPage.sortDropdown).toHaveValue('za');
    await expect(inventoryPage.itemNames).toHaveText(names(redTShirt, onesie, fleeceJacket, boltTShirt, bikeLight, backpack));
  });

  test('Sorting by Price (low to high) orders items ascending by price', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.sortDropdown).toHaveValue('lohi');
    await expect(inventoryPage.itemNames).toHaveText(names(onesie, bikeLight, boltTShirt, redTShirt, backpack, fleeceJacket));

    // Prices never decrease from top to bottom
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('Sorting by Price (high to low) orders items descending by price', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    await expect(inventoryPage.sortDropdown).toHaveValue('hilo');
    await expect(inventoryPage.itemNames).toHaveText(names(fleeceJacket, backpack, boltTShirt, redTShirt, bikeLight, onesie));

    // Prices never increase from top to bottom
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
