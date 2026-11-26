// @ts-check
import { defineConfig, devices } from '@playwright/test';

// Load a local .env if there is one (Node 20.12+). CI passes the same variables directly.
try {
  process.loadEnvFile();
} catch {
  // no .env file: fall back to the defaults below
}

const AUTH_FILE = 'playwright/.auth/standard_user.json';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries: a retry turns a flaky test into a silent pass. Flakiness is reported by the
     nightly Flake Forensics job instead (see README > Flakiness). */
  retries: 0,
  /* SauceDemo keeps all state per browser context, so tests are safe to run in parallel. */
  workers: process.env.CI ? 4 : undefined,
  /* list for the console, html for people, junit for CI tools (Azure DevOps, Flake Forensics, metrics) */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    /* Override per environment with BASE_URL (see .env.example). */
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    /* SauceDemo marks elements with data-test="..."; getByTestId() uses it. */
    testIdAttribute: 'data-test',
    /* Keep a trace of every failure (there are no retries to record one on). */
    trace: 'retain-on-failure',
  },

  projects: [
    /* Logs in once and saves the session; browser projects start from it. */
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
  ],
});
