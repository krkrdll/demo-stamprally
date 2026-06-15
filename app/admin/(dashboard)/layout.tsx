import AdminHeader from '@/components/admin/AdminHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
