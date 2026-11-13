import { test, expect } from '@backend/fixtures/api.fixtures';
import { API_MESSAGES } from '@backend/data/api.data';
import type { LoginResponse } from '@backend/api/types';
import { decodeJwtPayload } from '@backend/utils/jwt';

test.describe('API /login', { tag: '@api' }, () => {
  test('API-02 Iniciar sesión con el usuario creado devuelve un token', { tag: '@smoke' }, async ({ serveRest, adminUser }) => {
    const response = await serveRest.login({ email: adminUser.email, password: adminUser.password });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as LoginResponse;
    expect(body).toEqual({
      message: API_MESSAGES.LOGIN_SUCCESS,
      authorization: expect.stringMatching(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/),
    });

    const tokenPayload = decodeJwtPayload<{ email: string }>(body.authorization);
    expect(tokenPayload.email, 'El token debe pertenecer al usuario que inició sesión').toBe(adminUser.email);
  });
});
