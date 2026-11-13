import type { TestInfo } from '@playwright/test';
import type { ServeRestClient } from './ServeRestClient';

/**
 * Registra los datos que crea un test y los elimina al terminar ese test.
 *
 * Orden de limpieza: primero productos (requieren el token de un admin que aún exista)
 * y luego usuarios. Si una limpieza falla no se rompe el resultado del test:
 * se deja una anotación visible en el reporte HTML.
 */
export class ApiDataRegistry {
  private readonly products: { id: string; token: string }[] = [];
  private readonly users: string[] = [];

  constructor(
    private readonly client: ServeRestClient,
    private readonly testInfo: TestInfo,
  ) {}

  trackUser(id: string): void {
    this.users.push(id);
  }

  trackProduct(id: string, token: string): void {
    this.products.push({ id, token });
  }

  async cleanup(): Promise<void> {
    for (const { id, token } of this.products.splice(0)) {
      await this.run(`producto ${id}`, () => this.client.deleteProduct(id, token));
    }
    for (const id of this.users.splice(0)) {
      await this.run(`usuario ${id}`, () => this.client.deleteUser(id));
    }
  }

  private async run(label: string, action: () => Promise<{ ok(): boolean; status(): number }>): Promise<void> {
    try {
      const response = await action();
      if (!response.ok()) {
        this.warn(`No se pudo eliminar ${label} (HTTP ${response.status()})`);
      }
    } catch (error) {
      this.warn(`Error eliminando ${label}: ${String(error)}`);
    }
  }

  private warn(description: string): void {
    this.testInfo.annotations.push({ type: 'cleanup-warning', description });
  }
}
