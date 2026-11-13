import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { When, Then } from '@frontend/fixtures/ui.fixtures';
import type { CartItemList, LineItem } from '@frontend/pages/components/CartItemList';
import type { SelectedProduct } from '@frontend/pages/InventoryPage';
import { formatCents, sumCents } from '@frontend/utils/price';

/** Compara la lista mostrada con lo elegido, sin depender del orden de las líneas. */
async function expectSameProducts(itemList: CartItemList, selected: SelectedProduct[]): Promise<void> {
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
  const expected: LineItem[] = selected
    .map(({ name, priceCents }) => ({ name, priceCents, quantity: 1 }))
    .sort(byName);

  // Espera web-first a que estén todas las líneas antes de leerlas
  await expect(itemList.items).toHaveCount(expected.length);
  expect((await itemList.getLineItems()).sort(byName)).toEqual(expected);
}

When('agrega al carrito los productos:', async ({ inventoryPage, ctx }, table: DataTable) => {
  for (const { producto } of table.hashes()) {
    ctx.selectedProducts.push(await inventoryPage.addProductToCart(producto));
  }
});

Then('el contador del carrito muestra {int}', async ({ inventoryPage }, count: number) => {
  await expect(inventoryPage.header.cartBadge).toHaveText(String(count));
});

When('abre el carrito', async ({ inventoryPage, cartPage }) => {
  await inventoryPage.header.openCart();
  await cartPage.expectLoaded();
});

Then('el carrito contiene exactamente los productos elegidos', async ({ cartPage, ctx }) => {
  await expectSameProducts(cartPage.itemList, ctx.selectedProducts);
});

When(
  'continúa al checkout con los datos del comprador:',
  async ({ cartPage, checkoutInformationPage }, table: DataTable) => {
    const [buyer] = table.hashes();
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.expectLoaded();
    await checkoutInformationPage.submitCustomerInformation({
      firstName: buyer.nombre,
      lastName: buyer.apellido,
      postalCode: buyer.codigoPostal,
    });
  },
);

Then('el resumen contiene exactamente los productos elegidos', async ({ checkoutOverviewPage, ctx }) => {
  await checkoutOverviewPage.expectLoaded();
  await expectSameProducts(checkoutOverviewPage.itemList, ctx.selectedProducts);
});

Then('el Item total es la suma de los precios de los productos elegidos', async ({ checkoutOverviewPage, ctx }) => {
  const expectedItemTotal = sumCents(ctx.selectedProducts.map((product) => product.priceCents));
  await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(`Item total: ${formatCents(expectedItemTotal)}`);
  expect(await checkoutOverviewPage.getItemTotalInCents()).toBe(expectedItemTotal);
});

Then('el Total es el Item total más el impuesto', async ({ checkoutOverviewPage }) => {
  const [itemTotal, tax, total] = await Promise.all([
    checkoutOverviewPage.getItemTotalInCents(),
    checkoutOverviewPage.getTaxInCents(),
    checkoutOverviewPage.getTotalInCents(),
  ]);
  expect(total).toBe(itemTotal + tax);
});

When('finaliza la compra', async ({ checkoutOverviewPage, checkoutCompletePage }) => {
  await checkoutOverviewPage.finish();
  await checkoutCompletePage.expectLoaded();
});

Then('ve la confirmación {string}', async ({ checkoutCompletePage }, header: string) => {
  await expect(checkoutCompletePage.completeHeader).toHaveText(header);
});

Then('ve el detalle {string}', async ({ checkoutCompletePage }, detail: string) => {
  await expect(checkoutCompletePage.completeText).toHaveText(detail);
});

Then('el carrito queda vacío', async ({ checkoutCompletePage }) => {
  await expect(checkoutCompletePage.header.cartBadge).toBeHidden();
});
