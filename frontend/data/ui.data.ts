/**
 * Datos de prueba de UI (SauceDemo).
 * Los textos esperados se centralizan aquí para que un cambio de copy se corrija en un solo lugar.
 */

export const PRODUCTS = {
  BACKPACK: 'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  BOLT_TSHIRT: 'Sauce Labs Bolt T-Shirt',
  FLEECE_JACKET: 'Sauce Labs Fleece Jacket',
  ONESIE: 'Sauce Labs Onesie',
  RED_TSHIRT: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export type ProductName = (typeof PRODUCTS)[keyof typeof PRODUCTS];

/** Productos elegidos para el escenario de compra (UI-03). */
export const PRODUCTS_TO_BUY: readonly ProductName[] = [PRODUCTS.BACKPACK, PRODUCTS.BIKE_LIGHT];

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CUSTOMER: Customer = {
  firstName: 'Ana',
  lastName: 'Quispe',
  postalCode: '15001',
};

export const UI_MESSAGES = {
  LOCKED_OUT_ERROR: 'Epic sadface: Sorry, this user has been locked out.',
  INVENTORY_REQUIRES_LOGIN: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
  ORDER_COMPLETE_HEADER: 'Thank you for your order!',
  ORDER_COMPLETE_TEXT: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
} as const;
