import { test, expect } from '@frontend/fixtures/ui.fixtures';
import { SortOption } from '@frontend/pages/InventoryPage';
import { formatCents } from '@frontend/utils/price';

test.describe('Ordenamiento del listado', { tag: '@ui' }, () => {
  test('UI-04 Ordenar por precio de menor a mayor', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();

    const initialPrices = await inventoryPage.getPricesInCents();
    const expectedPrices = [...initialPrices].sort((a, b) => a - b);

    // Si el listado ya viniera ordenado, la prueba pasaría sin demostrar nada
    expect(initialPrices, 'El orden inicial no debería estar ya ordenado por precio').not.toEqual(expectedPrices);

    await inventoryPage.sortBy(SortOption.PRICE_LOW_TO_HIGH);

    await expect(inventoryPage.activeSortOption).toHaveText(SortOption.PRICE_LOW_TO_HIGH.label);
    // Aserción web-first sobre la lista COMPLETA: mismo número de elementos y orden exacto
    await expect(inventoryPage.itemPrices).toHaveText(expectedPrices.map(formatCents));
  });
});
