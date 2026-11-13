import { test, expect } from '@fixtures/api.fixtures';
import { API_MESSAGES, buildUser } from '@data/api.data';
import type { CreatedResponse, MessageResponse, User, UserListResponse } from '@api/types';

test.describe('API /usuarios', { tag: '@api' }, () => {
  test('API-01 Crear usuario administrador', { tag: '@smoke' }, async ({ serveRest, apiData }) => {
    const newUser = buildUser({ administrador: 'true' });

    const userId = await test.step('POST /usuarios responde 201 con mensaje e id', async () => {
      const response = await serveRest.createUser(newUser);
      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');

      const body = (await response.json()) as CreatedResponse;
      apiData.trackUser(body._id);
      expect(body).toEqual({ message: API_MESSAGES.REGISTER_SUCCESS, _id: expect.any(String) });
      expect(body._id).toMatch(/^[a-zA-Z0-9]{16}$/);
      return body._id;
    });

    await test.step('El usuario quedó guardado con los datos enviados', async () => {
      const response = await serveRest.getUser(userId);
      expect(response.status()).toBe(200);
      expect((await response.json()) as User).toEqual({ ...newUser, _id: userId });
    });
  });

  test('API-05 No permite registrar un email duplicado', async ({ serveRest, adminUser }) => {
    // Mismo email que un usuario ya registrado, resto de datos distintos
    const duplicatedUser = buildUser({ email: adminUser.email });

    await test.step('POST /usuarios responde 400 con el mensaje de email en uso', async () => {
      const response = await serveRest.createUser(duplicatedUser);
      expect(response.status()).toBe(400);
      expect((await response.json()) as MessageResponse).toEqual({ message: API_MESSAGES.EMAIL_ALREADY_USED });
    });

    await test.step('Sigue existiendo un único usuario con ese email y no fue modificado', async () => {
      const response = await serveRest.findUsers({ email: adminUser.email });
      expect(response.status()).toBe(200);
      expect((await response.json()) as UserListResponse).toEqual({ quantidade: 1, usuarios: [adminUser] });
    });
  });
});
