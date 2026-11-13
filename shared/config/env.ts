import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Punto único de configuración de la suite.
 *
 * Ningún test conoce URLs ni credenciales: todo se lee de aquí.
 * dotenv NO sobrescribe variables ya definidas, así que la precedencia es:
 *   variables del sistema/CI  >  .env (local)  >  env/.env.<TEST_ENV>
 */
const testEnv = process.env.TEST_ENV ?? 'qa';
const rootDir = path.resolve(__dirname, '..', '..');

dotenv.config({
  path: [path.join(rootDir, '.env'), path.join(rootDir, 'env', `.env.${testEnv}`)],
  quiet: true,
});

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta la variable de entorno "${name}". ` +
        `Defínela en env/.env.${testEnv}, en un archivo .env o en el entorno del sistema.`,
    );
  }
  return value;
}

function requiredUrl(name: string): string {
  const value = required(name);
  try {
    // Normaliza y valida el formato (falla rápido si la URL está mal escrita)
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`La variable "${name}" no es una URL válida: "${value}"`);
  }
}

export const env = {
  testEnv,
  ui: {
    baseUrl: requiredUrl('UI_BASE_URL'),
    password: required('SAUCE_PASSWORD'),
    users: {
      standard: required('SAUCE_STANDARD_USER'),
      lockedOut: required('SAUCE_LOCKED_USER'),
    },
  },
  api: {
    baseUrl: requiredUrl('API_BASE_URL'),
  },
} as const;
