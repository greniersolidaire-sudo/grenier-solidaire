import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <AdminSidebar user={session.user} />
      <div className="bg-bg overflow-hidden">{children}</div>
    </div>
  );
}
