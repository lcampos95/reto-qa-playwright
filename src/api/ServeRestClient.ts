import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Credentials, ProductPayload, UserPayload } from './types';

const ENDPOINTS = {
  USERS: '/usuarios',
  LOGIN: '/login',
  PRODUCTS: '/produtos',
} as const;

/**
 * Cliente delgado sobre el request context de Playwright.
 *
 * Responsabilidad: saber CÓMO llamar a cada endpoint (ruta, método, headers).
 * No hace aserciones: devuelve la APIResponse para que cada test valide
 * lo que le corresponde (incluidos los casos de error).
 * La base URL viene de la configuración del proyecto "api".
 */
export class ServeRestClient {
  constructor(private readonly request: APIRequestContext) {}

  // ---------- Usuarios ----------
  createUser(user: UserPayload): Promise<APIResponse> {
    return this.request.post(ENDPOINTS.USERS, { data: user });
  }

  getUser(id: string): Promise<APIResponse> {
    return this.request.get(`${ENDPOINTS.USERS}/${id}`);
  }

  findUsers(filters: Partial<UserPayload>): Promise<APIResponse> {
    return this.request.get(ENDPOINTS.USERS, { params: filters });
  }

  deleteUser(id: string): Promise<APIResponse> {
    return this.request.delete(`${ENDPOINTS.USERS}/${id}`);
  }

  // ---------- Login ----------
  login(credentials: Credentials): Promise<APIResponse> {
    return this.request.post(ENDPOINTS.LOGIN, { data: credentials });
  }

  // ---------- Productos ----------
  /** Sin `token` la petición se envía sin header Authorization (caso API-04). */
  createProduct(product: ProductPayload, token?: string): Promise<APIResponse> {
    return this.request.post(ENDPOINTS.PRODUCTS, {
      data: product,
      headers: token ? { Authorization: token } : {},
    });
  }

  getProduct(id: string): Promise<APIResponse> {
    return this.request.get(`${ENDPOINTS.PRODUCTS}/${id}`);
  }

  findProducts(filters: Partial<ProductPayload>): Promise<APIResponse> {
    return this.request.get(ENDPOINTS.PRODUCTS, { params: filters });
  }

  deleteProduct(id: string, token: string): Promise<APIResponse> {
    return this.request.delete(`${ENDPOINTS.PRODUCTS}/${id}`, { headers: { Authorization: token } });
  }
}
