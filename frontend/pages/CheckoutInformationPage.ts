import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Paso 1 del checkout: datos del comprador (/checkout-step-one.html). */
export class CheckoutInformationPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  protected readonly titleText = 'Checkout: Your Information';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
  }

  async submitCustomerInformation(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
    await this.continueButton.click();
  }
}
