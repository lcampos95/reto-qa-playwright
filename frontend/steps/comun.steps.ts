import { expect } from '@playwright/test';
import { Given, Then } from '@frontend/fixtures/ui.fixtures';

// Pasos reutilizados por más de una característica.

Given('que el usuario autenticado está en el listado de productos', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.expectLoaded();
});

Then('ve el mensaje de error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.errorMessage).toHaveText(message);
});
