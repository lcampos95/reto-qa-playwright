import { test, expect } from '@fixtures/api.fixtures';
import { API_MESSAGES, buildProduct } from '@data/api.data';
import type { CreatedResponse, MessageResponse, Product, ProductListResponse } from '@api/types';

test.describe('API /produtos', { tag: '@api' }, () => {
  test('API-03 Crear un producto y consultarlo por id', { tag: '@smoke' }, async ({ serveRest, apiData, adminToken }) => {
    const newProduct = buildProduct();

    const productId = await test.step('POST /produtos con token de administrador responde 201', async () => {
      const response = await serveRest.createProduct(newProduct, adminToken);
      expect(response.status()).toBe(201);

      const body = (await response.json()) as CreatedResponse;
      apiData.trackProduct(body._id, adminToken);
      expect(body).toEqual({ message: API_MESSAGES.REGISTER_SUCCESS, _id: expect.any(String) });
      return body._id;
    });

    await test.step('GET /produtos/{_id} devuelve exactamente los datos enviados', async () => {
      const response = await serveRest.getProduct(productId);
      expect(response.status()).toBe(200);
      expect((await response.json()) as Product).toEqual({ ...newProduct, _id: productId });
    });
  });

  test('API-04 Crear producto sin token es rechazado', async ({ serveRest }) => {
    const newProduct = buildProduct();

    await test.step('POST /produtos sin Authorization responde 401 con mensaje', async () => {
      const response = await serveRest.createProduct(newProduct);
      expect(response.status()).toBe(401);
      expect((await response.json()) as MessageResponse).toEqual({ message: API_MESSAGES.TOKEN_MISSING_OR_INVALID });
    });

    await test.step('El producto no fue creado', async () => {
      const response = await serveRest.findProducts({ nome: newProduct.nome });
      expect(response.status()).toBe(200);
      expect((await response.json()) as ProductListResponse).toEqual({ quantidade: 0, produtos: [] });
    });
  });
});
