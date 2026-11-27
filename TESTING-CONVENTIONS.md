# Test conventions

Every test, whether a person or an agent wrote it, follows these rules. `npm run guardrails`
enforces the mechanical ones in CI.

| Rule | How |
|---|---|
| Import from the fixtures | `import { test, expect } from '../../fixtures';` never from `@playwright/test` (only `tests/auth.setup.ts` may) |
| Use page objects, not raw locators | Page objects live in `pages/`. If a locator is missing, **add it to the page object**, then use it |
| Start logged in | Tests start as `standard_user` (saved by `tests/auth.setup.ts`). Begin with `await inventoryPage.goto();` and never repeat the login steps |
| Start logged out only when needed | `test.use({ storageState: NO_AUTH })` from `test-data/users`, then `loginPage.goto()` / `loginPage.login(USERS.x)` |
| No hard-coded URLs or credentials | Relative paths (`'/'`, `'/cart.html'`) resolve against `BASE_URL`; users and password come from `test-data/users.ts` |
| Products by constant | `PRODUCTS.backpack` etc. from `pages/products.ts`, not name or slug strings |
| No hard waits, no retries | Rely on Playwright's auto-waiting and web-first assertions |
| One scenario per test, plan headers kept | `// spec:` and `// seed:` comments at the top, test title = scenario name |

Example:

```ts
// spec: specs/shopping-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../pages';

test.describe('Cart Page', () => {
  test('Adding an item shows it in the cart', async ({ page, header, inventoryPage, cartPage }) => {
    // 1. Add the Backpack from the inventory page
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack);

    // 2. Open the cart - the Backpack is listed once
    await header.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.item(PRODUCTS.backpack)).toHaveCount(1);
  });
});
```
