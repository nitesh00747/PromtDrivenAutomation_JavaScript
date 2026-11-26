/**
 * Test users and credentials. Values come from the environment (.env or CI secrets) so the
 * same suite can run against dev, QA or UAT; the defaults are SauceDemo's public demo values.
 */
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export const CHECKOUT_INFO = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345',
} as const;

/** Where the setup project saves the logged-in session (git-ignored). */
export const AUTH_FILE = 'playwright/.auth/standard_user.json';

/** Use with test.use({ storageState: NO_AUTH }) for tests that must start logged out. */
export const NO_AUTH = { cookies: [], origins: [] };
