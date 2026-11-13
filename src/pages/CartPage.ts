import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartItemList } from './components/CartItemList';

/** Carrito (/cart.html). */
export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  protected readonly titleText = 'Your Cart';

  readonly itemList: CartItemList;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemList = new CartItemList(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
