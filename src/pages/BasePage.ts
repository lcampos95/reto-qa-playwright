import { expect, type Locator, type Page } from '@playwright/test';
import { Header } from './components/Header';

/**
 * Base de todos los page objects.
 * Cada página declara su ruta y su título; así "estar en la página" se valida
 * siempre igual (URL + título visible) en lugar de repetirlo en cada test.
 */
export abstract class BasePage {
  protected abstract readonly path: string;
  protected abstract readonly titleText: string;

  readonly title: Locator;
  readonly header: Header;

  constructor(protected readonly page: Page) {
    this.title = page.getByTestId('title');
    this.header = new Header(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(this.path)}$`));
    await expect(this.title).toHaveText(this.titleText);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
