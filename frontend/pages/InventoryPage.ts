import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePriceToCents } from '@frontend/utils/price';

export interface SelectedProduct {
  name: string;
  priceCents: number;
}

/** Valores del <select> de ordenamiento de SauceDemo. */
export const SortOption = {
  NAME_A_TO_Z: { value: 'az', label: 'Name (A to Z)' },
  NAME_Z_TO_A: { value: 'za', label: 'Name (Z to A)' },
  PRICE_LOW_TO_HIGH: { value: 'lohi', label: 'Price (low to high)' },
  PRICE_HIGH_TO_LOW: { value: 'hilo', label: 'Price (high to low)' },
} as const;

export type SortOption = (typeof SortOption)[keyof typeof SortOption];

/** Listado de productos (/inventory.html). */
export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly titleText = 'Products';

  readonly items: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly activeSortOption: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.activeSortOption = page.getByTestId('active-option');
  }

  /** Tarjeta de un producto localizada por su nombre exacto (no por posición). */
  productCard(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /**
   * Agrega un producto y devuelve el nombre y precio que muestra la tarjeta,
   * para que el test compare luego contra lo que realmente eligió.
   */
  async addProductToCart(name: string): Promise<SelectedProduct> {
    const card = this.productCard(name);
    await expect(card, `El producto "${name}" debe existir en el listado`).toHaveCount(1);

    const priceText = await card.getByTestId('inventory-item-price').innerText();
    await card.getByRole('button', { name: 'Add to cart' }).click();
    // Confirma que la acción tuvo efecto antes de continuar (sin esperas fijas)
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();

    return { name, priceCents: parsePriceToCents(priceText) };
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option.value);
  }

  /** Precios en el orden en que se muestran, en centavos. */
  async getPricesInCents(): Promise<number[]> {
    await expect(this.itemPrices.first()).toBeVisible();
    const texts = await this.itemPrices.allInnerTexts();
    return texts.map(parsePriceToCents);
  }
}
