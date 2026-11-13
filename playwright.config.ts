import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { STANDARD_USER_STATE } from './src/config/auth-state';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // SauceDemo expone atributos data-test: permite usar getByTestId() con locators estables
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ---------- UI (SauceDemo) ----------
    {
      name: 'setup',
      testDir: './tests/ui',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: env.ui.baseUrl, ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.ui.baseUrl,
        storageState: STANDARD_USER_STATE,
      },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        baseURL: env.ui.baseUrl,
        storageState: STANDARD_USER_STATE,
      },
    },

    // ---------- API (ServeRest) ----------
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.api.baseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
