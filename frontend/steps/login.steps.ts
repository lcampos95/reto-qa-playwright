import { expect } from '@playwright/test';
import { Given, When, Then } from '@frontend/fixtures/ui.fixtures';
import { PASSWORD, usernameFor } from '@frontend/data/users';

Given('que el usuario está en la página de inicio de sesión', async ({ loginPage }) => {
  await loginPage.goto();
});

When('inicia sesión como usuario {string}', async ({ loginPage }, role: string) => {
  await loginPage.login(usernameFor(role), PASSWORD);
});

When('intenta abrir el listado de productos directamente', async ({ inventoryPage }) => {
  await inventoryPage.goto();
});

Then('accede al listado de productos', async ({ inventoryPage, loginPage }) => {
  await inventoryPage.expectLoaded();
  await expect(inventoryPage.items).not.toHaveCount(0);
  await expect(inventoryPage.header.cartLink).toBeVisible();
  await expect(loginPage.errorMessage).toBeHidden();
});

Then('permanece en la página de inicio de sesión sin ver productos', async ({ page, loginPage, inventoryPage }) => {
  await expect(page).not.toHaveURL(/inventory\.html/);
  await expect(loginPage.loginButton).toBeVisible();
  await expect(inventoryPage.items).toHaveCount(0);
});
