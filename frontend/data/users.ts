import { env } from '@shared/config/env';

/**
 * Usuarios de SauceDemo por ROL de negocio.
 * Los .feature hablan de "standard" o "bloqueado"; el usuario real
 * sale de la configuración, así no hay credenciales en los escenarios.
 */
const USERS_BY_ROLE = {
  standard: env.ui.users.standard,
  bloqueado: env.ui.users.lockedOut,
} as const;

export type UserRole = keyof typeof USERS_BY_ROLE;

export function usernameFor(role: string): string {
  if (!(role in USERS_BY_ROLE)) {
    throw new Error(`Rol de usuario desconocido "${role}". Roles válidos: ${Object.keys(USERS_BY_ROLE).join(', ')}`);
  }
  return USERS_BY_ROLE[role as UserRole];
}

export const PASSWORD = env.ui.password;
