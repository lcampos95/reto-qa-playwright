import type { Locator, Page } from '@playwright/test';
import { parsePriceToCents } from '@utils/price';

export interface LineItem {
  name: string;
  priceCents: number;
  quantity: number;
}

/**
 * Lista de productos del carrito. El mismo marcado se usa en el carrito
 * y en el resumen del checkout, por eso es un componente reutilizable.
 */
export class CartItemList {
  readonly items: Locator;

  constructor(page: Page) {
    this.items = page.getByTestId('inventory-item');
  }

  /**
   * Lee nombre, precio y cantidad de cada línea.
   * Antes de llamarlo, el test debe esperar con una aserción web-first
   * (p. ej. toHaveCount) para no leer la lista a medio renderizar.
   */
  async getLineItems(): Promise<LineItem[]> {
    const lines: LineItem[] = [];
    for (const item of await this.items.all()) {
      const [name, price, quantity] = await Promise.all([
        item.getByTestId('inventory-item-name').innerText(),
        item.getByTestId('inventory-item-price').innerText(),
        item.getByTestId('item-quantity').innerText(),
      ]);
      lines.push({ name: name.trim(), priceCents: parsePriceToCents(price), quantity: Number(quantity) });
    }
    return lines;
  }
}
