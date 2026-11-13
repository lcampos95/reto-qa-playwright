// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', 'playwright/', '.features-gen/'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Un await olvidado es la causa nº 1 de tests flaky en Playwright
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    files: ['frontend/setup/**/*.ts', 'frontend/steps/**/*.ts', 'backend/tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Requisito del reto: sin esperas fijas
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      // Las aserciones viven en los tests y en los page objects (expect* helpers)
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect'] }],
    },
  },
  {
    // En BDD las aserciones viven en los pasos "Entonces", fuera de un test()
    files: ['frontend/steps/**/*.ts'],
    rules: { 'playwright/no-standalone-expect': 'off' },
  },
  { files: ['eslint.config.mjs'], ...tseslint.configs.disableTypeChecked },
);
