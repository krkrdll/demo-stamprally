'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';

export type LoginState = { error: string } | null;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (
    username !== process.env['ADMIN_USERNAME'] ||
    password !== process.env['ADMIN_PASSWORD']
  ) {
    return { error: 'ユーザー名またはパスワードが正しくありません' };
  }

  await createSession();
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/admin/login');
}
