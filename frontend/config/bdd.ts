import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { defineBddConfig } from 'playwright-bdd';

/**
 * Configuración BDD del frontend (playwright-bdd).
 * Los escenarios se escriben en Gherkin (frontend/features) y los pasos
 * (frontend/steps) usan los page objects. playwright-bdd traduce cada
 * escenario a un test de Playwright, así se sigue usando el runner @playwright/test.
 */
export const FRONTEND_BDD_TEST_DIR = defineBddConfig({
  features: 'frontend/features/**/*.feature',
  featuresRoot: 'frontend/features',
  steps: ['frontend/steps/**/*.ts', 'frontend/fixtures/ui.fixtures.ts'],
  outputDir: '.features-gen/frontend',
  language: 'es',
  // Si un paso del .feature no tiene implementación, falla al generar (no en mitad de la ejecución)
  missingSteps: 'fail-on-gen',
});

/**
 * Genera los tests desde los .feature (equivale a `npx bddgen`).
 *
 * Se llama desde playwright.config.ts para que `npx playwright test` funcione
 * sin un paso previo, como pide el reto. Solo corre en el proceso principal:
 *  - no dentro de bddgen (PLAYWRIGHT_BDD_GEN), que vuelve a cargar esta config;
 *  - no en los workers de Playwright (TEST_WORKER_INDEX), que también la cargan.
 */
export function generateBddTests(): void {
  if (process.env.PLAYWRIGHT_BDD_GEN || process.env.TEST_WORKER_INDEX) return;

  const bddgenCli = path.join(path.dirname(require.resolve('playwright-bdd/package.json')), 'dist', 'cli', 'index.js');
  execFileSync(process.execPath, [bddgenCli], { stdio: 'inherit' });
}
