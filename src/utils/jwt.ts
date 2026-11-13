/**
 * Decodifica (SIN verificar firma) el payload de un JWT.
 * Suficiente para comprobar a quién pertenece un token en una prueba;
 * la verificación de la firma es responsabilidad del backend.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const jwt = token.replace(/^Bearer\s+/i, '');
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error(`El token no tiene formato JWT (header.payload.signature): "${token}"`);
  }
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as T;
}
