import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 overflow-auto">
        <div className="max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
