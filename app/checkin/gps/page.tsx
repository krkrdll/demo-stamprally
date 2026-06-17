import { redirect } from 'next/navigation';

export default async function GpsCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) redirect(`/checkin/${id}`);
  redirect('/');
}
