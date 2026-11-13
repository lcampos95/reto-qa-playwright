import { defineConfig, devices } from '@playwright/test';
import { env } from './shared/config/env';
import { STANDARD_USER_STATE } from './frontend/config/auth-state';
import { FRONTEND_BDD_TEST_DIR, generateBddTests } from './frontend/config/bdd';

// Convierte los .feature del frontend en tests de Playwright antes de ejecutarlos
generateBddTests();

const isCI = !!process.env.CI;

/**
 * Una sola configuración con dos proyectos de pruebas:
 *  - frontend: UI de SauceDemo en BDD/Gherkin + POM (setup de sesión + Chromium + Firefox)
 *  - backend:  API de ServeRest (sin navegador)
 * `npx playwright test` ejecuta ambos y genera un único reporte HTML.
 */
export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 4,
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
    // ---------- FRONTEND · UI (SauceDemo) ----------
    {
      name: 'frontend-setup',
      testDir: './frontend/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.ui.baseUrl },
    },
    {
      name: 'frontend-chromium',
      testDir: FRONTEND_BDD_TEST_DIR,
      dependencies: ['frontend-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.ui.baseUrl,
        storageState: STANDARD_USER_STATE,
      },
    },
    {
      name: 'frontend-firefox',
      testDir: FRONTEND_BDD_TEST_DIR,
      dependencies: ['frontend-setup'],
      use: {
        ...devices['Desktop Firefox'],
        baseURL: env.ui.baseUrl,
        storageState: STANDARD_USER_STATE,
      },
    },

    // ---------- BACKEND · API (ServeRest) ----------
    {
      name: 'backend',
      testDir: './backend/tests',
      use: {
        baseURL: env.api.baseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
