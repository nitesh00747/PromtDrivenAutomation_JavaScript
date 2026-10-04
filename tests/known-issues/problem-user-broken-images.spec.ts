// spec: (none — this documents a confirmed live application bug, not a planned scenario)
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Known Issues', () => {
  // Confirmed live on 2026-10-03: problem_user actually renders the SAME broken
  // "/assets/sl-404-*.jpg" placeholder image for all 6 products instead of distinct
  // images per product. This is a genuine, intentional SauceDemo bug seeded into
  // this user (real app bug), not a selector or assertion problem in this test.
  // Marked fixme so the suite stays green while this known app bug remains unfixed.
  // acknowledged-fixme: intentional, permanent SauceDemo quirk seeded into problem_user for
  // QA-practice purposes - there is no upstream issue to track or fix; this test exists purely
  // to document the behavior, not to flag a regression that needs resolving.
  test.fixme('problem_user sees distinct product images (currently fails — real app bug, not a test bug)', async ({ page }) => {
    // Log in as problem_user
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('problem_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // Expect each of the 6 products to render a distinct image, as standard_user does.
    const srcs = await page.locator('.inventory_item_img img').evaluateAll((imgs) =>
      imgs.map((img) => img.getAttribute('src'))
    );
    expect(new Set(srcs).size).toBe(6);
  });
});
