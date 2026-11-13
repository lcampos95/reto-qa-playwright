import { test as base, expect } from '@playwright/test';
import { ServeRestClient } from '@backend/api/ServeRestClient';
import { ApiDataRegistry } from '@backend/api/ApiDataRegistry';
import type { CreatedResponse, LoginResponse, User } from '@backend/api/types';
import { buildUser } from '@backend/data/api.data';

/**
 * Fixtures de API. Cada test pide solo las precondiciones que necesita y
 * obtiene datos PROPIOS (nada se comparte entre tests), por lo que pueden
 * correr solos, en cualquier orden y en paralelo.
 */
type ApiFixtures = {
  /** Cliente de ServeRest sobre el request context del test. */
  serveRest: ServeRestClient;
  /** Registro de datos creados; se limpian automáticamente al terminar el test. */
  apiData: ApiDataRegistry;
  /** Precondición: un usuario administrador recién creado. */
  adminUser: User;
  /** Precondición: token (valor del campo authorization) del adminUser. */
  adminToken: string;
};

export const test = base.extend<ApiFixtures>({
  serveRest: async ({ request }, use) => {
    await use(new ServeRestClient(request));
  },

  apiData: async ({ serveRest }, use, testInfo) => {
    const registry = new ApiDataRegistry(serveRest, testInfo);
    await use(registry);
    await registry.cleanup();
  },

  adminUser: async ({ serveRest, apiData }, use) => {
    const payload = buildUser({ administrador: 'true' });
    const response = await serveRest.createUser(payload);
    expect(response.status(), 'Precondición: crear usuario administrador').toBe(201);

    const { _id } = (await response.json()) as CreatedResponse;
    apiData.trackUser(_id);
    await use({ ...payload, _id });
  },

  adminToken: async ({ serveRest, adminUser }, use) => {
    const response = await serveRest.login({ email: adminUser.email, password: adminUser.password });
    expect(response.status(), 'Precondición: login del administrador').toBe(200);

    const { authorization } = (await response.json()) as LoginResponse;
    await use(authorization);
  },
});

export { expect };
