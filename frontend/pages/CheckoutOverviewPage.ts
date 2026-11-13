import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartItemList } from './components/CartItemList';
import { parsePriceToCents } from '@frontend/utils/price';

/** Paso 2 del checkout: resumen y totales (/checkout-step-two.html). */
export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';
  protected readonly titleText = 'Checkout: Overview';

  readonly itemList: CartItemList;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemList = new CartItemList(page);
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  /** "Item total: $39.98" -> 3998 */
  async getItemTotalInCents(): Promise<number> {
    return parsePriceToCents(await this.itemTotalLabel.innerText());
  }

  async getTaxInCents(): Promise<number> {
    return parsePriceToCents(await this.taxLabel.innerText());
  }

  async getTotalInCents(): Promise<number> {
    return parsePriceToCents(await this.totalLabel.innerText());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
