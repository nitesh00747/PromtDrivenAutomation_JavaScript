import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { AUTH_FILE, USERS } from '../test-data/users';

// Runs once before the browser projects: log in through the UI and save the session, so every
// logged-in test starts on the inventory page without repeating the login steps.
setup('log in as standard_user and save the session', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: AUTH_FILE });
});
