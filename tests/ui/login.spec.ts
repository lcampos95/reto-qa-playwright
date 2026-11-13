import { test, expect } from '@fixtures/ui.fixtures';
import { env } from '@config/env';
import { UI_MESSAGES } from '@data/ui.data';

test.describe('Inicio de sesión', { tag: '@ui' }, () => {
  // Estos escenarios prueban el login en sí: arrancan SIN la sesión reutilizada
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('UI-01 Inicio de sesión exitoso con standard_user', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(env.ui.users.standard, env.ui.password);

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).not.toHaveCount(0);
    await expect(inventoryPage.header.cartLink).toBeVisible();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('UI-02 Usuario bloqueado no puede iniciar sesión', async ({ page, loginPage, inventoryPage }) => {
    await test.step('Intentar iniciar sesión con locked_out_user', async () => {
      await loginPage.login(env.ui.users.lockedOut, env.ui.password);
    });

    await test.step('Se muestra el mensaje de usuario bloqueado y permanece en el login', async () => {
      await expect(loginPage.errorMessage).toHaveText(UI_MESSAGES.LOCKED_OUT_ERROR);
      await expect(loginPage.loginButton).toBeVisible();
      await expect(page).not.toHaveURL(/inventory\.html/);
      await expect(inventoryPage.items).toHaveCount(0);
    });

    await test.step('Tampoco puede entrar al listado navegando directo a la URL', async () => {
      await inventoryPage.goto();
      await expect(page).not.toHaveURL(/inventory\.html/);
      await expect(loginPage.errorMessage).toHaveText(UI_MESSAGES.INVENTORY_REQUIRES_LOGIN);
    });
  });
});
