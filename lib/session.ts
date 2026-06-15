import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getKey, verifyToken } from './session-edge';

export { verifyToken };

const EXPIRES_IN = 60 * 60 * 8; // 8 hours

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(getKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: EXPIRES_IN,
    path: '/',
    sameSite: 'lax',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
