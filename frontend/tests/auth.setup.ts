import { test as setup } from '@playwright/test';
import { env } from '@shared/config/env';
import { STANDARD_USER_STATE } from '@frontend/config/auth-state';
import { LoginPage } from '@frontend/pages/LoginPage';
import { InventoryPage } from '@frontend/pages/InventoryPage';

/**
 * Inicia sesión UNA vez con standard_user y guarda el storageState.
 * Los tests de UI arrancan ya autenticados (cada uno en su propio contexto),
 * lo que ahorra tiempo sin crear dependencias entre tests.
 */
setup('autenticar standard_user y guardar la sesión', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(env.ui.users.standard, env.ui.password);
  await inventoryPage.expectLoaded();

  await page.context().storageState({ path: STANDARD_USER_STATE });
});
