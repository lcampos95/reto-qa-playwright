/**
 * Utilidades de precios.
 * Se trabaja en CENTAVOS (enteros) para evitar errores de coma flotante:
 * 29.99 + 9.99 en float = 39.980000000000004, en centavos 2999 + 999 = 3998.
 */
const PRICE_PATTERN = /\$\s*(\d+(?:\.\d{1,2})?)/;

/** "$29.99" o "Item total: $39.98" -> 2999 / 3998 */
export function parsePriceToCents(text: string): number {
  const match = PRICE_PATTERN.exec(text);
  if (!match) {
    throw new Error(`No se encontró un precio con formato "$0.00" en el texto: "${text}"`);
  }
  return Math.round(Number(match[1]) * 100);
}

/** 3998 -> "$39.98" (mismo formato que muestra SauceDemo) */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
