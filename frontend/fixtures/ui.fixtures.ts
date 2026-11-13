import { test as bddBase, createBdd } from 'playwright-bdd';
import { LoginPage } from '@frontend/pages/LoginPage';
import { InventoryPage, type SelectedProduct } from '@frontend/pages/InventoryPage';
import { CartPage } from '@frontend/pages/CartPage';
import { CheckoutInformationPage } from '@frontend/pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '@frontend/pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '@frontend/pages/CheckoutCompletePage';

/**
 * Estado compartido ENTRE LOS PASOS de un mismo escenario
 * (p. ej. qué productos eligió el usuario). Se crea vacío en cada escenario,
 * así los escenarios siguen siendo independientes.
 */
export interface ScenarioContext {
  selectedProducts: SelectedProduct[];
  initialPricesInCents: number[];
}

/** Tag de Gherkin para escenarios que deben empezar SIN la sesión reutilizada. */
export const NO_SESSION_TAG = '@sin-sesion';

type UiFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  ctx: ScenarioContext;
};

/**
 * Fixtures del frontend. Parten del `test` de playwright-bdd (que a su vez
 * extiende el de @playwright/test): los pasos reciben los page objects ya
 * creados sobre el `page` aislado de cada escenario.
 */
export const test = bddBase.extend<UiFixtures>({
  // Los escenarios con @sin-sesion (login) arrancan con el navegador limpio;
  // el resto reutiliza la sesión guardada por frontend-setup.
  storageState: async ({ $tags, storageState }, use) => {
    await use($tags.includes(NO_SESSION_TAG) ? { cookies: [], origins: [] } : storageState);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  // eslint-disable-next-line no-empty-pattern -- Playwright exige desestructurar el primer argumento
  ctx: async ({}, use) => {
    await use({ selectedProducts: [], initialPricesInCents: [] });
  },
});

/** Funciones para definir pasos; reciben las fixtures de arriba. */
export const { Given, When, Then } = createBdd(test);
