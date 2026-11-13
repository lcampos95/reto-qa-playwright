import { randomInt, randomUUID } from 'node:crypto';
import type { ProductPayload, UserPayload } from '@backend/api/types';

/**
 * Builders de datos de API.
 * ServeRest es una instancia pública compartida: cada llamada genera datos ÚNICOS
 * (timestamp + fragmento de UUID) para no chocar con otras personas, con
 * ejecuciones anteriores ni con otros workers corriendo en paralelo.
 */
export function uniqueId(): string {
  return `${Date.now()}${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export function buildUser(overrides: Partial<UserPayload> = {}): UserPayload {
  const id = uniqueId();
  return {
    nome: `QA Automation ${id}`,
    email: `qa.automation.${id}@retoqa.com`,
    password: `Pw-${randomUUID()}`,
    administrador: 'true',
    ...overrides,
  };
}

export function buildProduct(overrides: Partial<ProductPayload> = {}): ProductPayload {
  const id = uniqueId();
  return {
    nome: `Producto QA ${id}`,
    preco: randomInt(10, 5_000),
    descricao: `Producto creado por la suite de Playwright (${id})`,
    quantidade: randomInt(1, 500),
    ...overrides,
  };
}

/** Mensajes de la API (en portugués, tal como responde ServeRest). */
export const API_MESSAGES = {
  REGISTER_SUCCESS: 'Cadastro realizado com sucesso',
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  EMAIL_ALREADY_USED: 'Este email já está sendo usado',
  TOKEN_MISSING_OR_INVALID: 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
} as const;
