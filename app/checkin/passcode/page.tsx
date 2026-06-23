import { redirect } from 'next/navigation';

export default async function PasscodeCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) redirect(`/checkin/${id}`);
  redirect('/');
}
