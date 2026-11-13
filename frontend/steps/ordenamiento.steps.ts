import { expect } from '@playwright/test';
import { Given, When, Then } from '@frontend/fixtures/ui.fixtures';
import { sortOptionByLabel } from '@frontend/pages/InventoryPage';
import { formatCents } from '@frontend/utils/price';

const ascending = (a: number, b: number) => a - b;
const descending = (a: number, b: number) => b - a;

Given('el listado inicial no está ordenado por precio', async ({ inventoryPage, ctx }) => {
  ctx.initialPricesInCents = await inventoryPage.getPricesInCents();

  // Si ya viniera ordenado, el escenario pasaría sin demostrar que el orden funciona
  const prices = ctx.initialPricesInCents;
  expect(prices.length, 'El listado debe tener más de un producto').toBeGreaterThan(1);
  expect(prices, 'El listado inicial ya está ordenado de menor a mayor').not.toEqual([...prices].sort(ascending));
  expect(prices, 'El listado inicial ya está ordenado de mayor a menor').not.toEqual([...prices].sort(descending));
});

When('ordena los productos por {string}', async ({ inventoryPage }, label: string) => {
  await inventoryPage.sortBy(sortOptionByLabel(label));
});

Then('el criterio de orden activo es {string}', async ({ inventoryPage }, label: string) => {
  await expect(inventoryPage.activeSortOption).toHaveText(label);
});

Then(
  /^el listado completo queda ordenado por precio de (menor a mayor|mayor a menor)$/,
  async ({ inventoryPage, ctx }, direction: string) => {
    if (ctx.initialPricesInCents.length === 0) {
      throw new Error('Este paso necesita antes el paso "el listado inicial no está ordenado por precio".');
    }
    const expected = [...ctx.initialPricesInCents].sort(direction === 'menor a mayor' ? ascending : descending);

    // Aserción web-first sobre la lista COMPLETA: misma cantidad de elementos y orden exacto
    await expect(inventoryPage.itemPrices).toHaveText(expected.map(formatCents));
  },
);
