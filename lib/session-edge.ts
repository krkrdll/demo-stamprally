import { jwtVerify } from 'jose';

export const COOKIE_NAME = 'admin-session';

export function getKey() {
  const secret = process.env['SESSION_SECRET'] ?? 'fallback-secret-key-please-set-env-var';
  return new TextEncoder().encode(secret);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getKey());
    return true;
  } catch {
    return false;
  }
}
