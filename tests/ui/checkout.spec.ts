import { test, expect } from '@fixtures/ui.fixtures';
import { CUSTOMER, PRODUCTS_TO_BUY, UI_MESSAGES } from '@data/ui.data';
import type { SelectedProduct } from '@pages/InventoryPage';
import type { LineItem } from '@pages/components/CartItemList';
import { formatCents, sumCents } from '@utils/price';

/** Normaliza para comparar sin depender del orden en que se listan los productos. */
const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);
const toExpectedLines = (products: SelectedProduct[]): LineItem[] =>
  products.map(({ name, priceCents }) => ({ name, priceCents, quantity: 1 })).sort(byName);

test.describe('Compra', { tag: '@ui' }, () => {
  test('UI-03 Compra completa de dos productos', { tag: '@smoke' }, async ({
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const selected: SelectedProduct[] = [];

    await test.step('Agregar dos productos al carrito', async () => {
      await inventoryPage.goto();
      await inventoryPage.expectLoaded();
      for (const productName of PRODUCTS_TO_BUY) {
        selected.push(await inventoryPage.addProductToCart(productName));
      }
      await expect(inventoryPage.header.cartBadge).toHaveText(String(PRODUCTS_TO_BUY.length));
    });

    await test.step('El carrito contiene exactamente los productos elegidos', async () => {
      await inventoryPage.header.openCart();
      await cartPage.expectLoaded();
      await expect(cartPage.itemList.items).toHaveCount(selected.length);

      const cartLines = await cartPage.itemList.getLineItems();
      expect(cartLines.sort(byName)).toEqual(toExpectedLines(selected));
    });

    await test.step('Completar los datos del comprador', async () => {
      await cartPage.proceedToCheckout();
      await checkoutInformationPage.expectLoaded();
      await checkoutInformationPage.submitCustomerInformation(CUSTOMER);
    });

    await test.step('El resumen muestra los productos y el Item total es la suma de sus precios', async () => {
      await checkoutOverviewPage.expectLoaded();
      await expect(checkoutOverviewPage.itemList.items).toHaveCount(selected.length);

      const overviewLines = await checkoutOverviewPage.itemList.getLineItems();
      expect(overviewLines.sort(byName)).toEqual(toExpectedLines(selected));

      const expectedItemTotal = sumCents(selected.map((product) => product.priceCents));
      await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(`Item total: ${formatCents(expectedItemTotal)}`);
      expect(await checkoutOverviewPage.getItemTotalInCents()).toBe(expectedItemTotal);

      // Coherencia adicional del resumen: Total = Item total + Tax
      const tax = await checkoutOverviewPage.getTaxInCents();
      expect(await checkoutOverviewPage.getTotalInCents()).toBe(expectedItemTotal + tax);
    });

    await test.step('Finalizar la compra y validar la confirmación', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectLoaded();
      await expect(checkoutCompletePage.completeHeader).toHaveText(UI_MESSAGES.ORDER_COMPLETE_HEADER);
      await expect(checkoutCompletePage.completeText).toHaveText(UI_MESSAGES.ORDER_COMPLETE_TEXT);
      // Tras la compra el carrito queda vacío
      await expect(checkoutCompletePage.header.cartBadge).toBeHidden();
    });
  });
});
