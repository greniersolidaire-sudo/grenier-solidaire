import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <AdminSidebar user={{
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'OPERATEUR',
      }} />
      <div className="bg-bg overflow-hidden">{children}</div>
    </div>
  );
}


// export const dynamic = 'force-dynamic';

// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { redirect } from 'next/navigation';
// import AdminSidebar from '@/components/admin/Sidebar';

// export default async function AdminLayout({ children }: { children: React.ReactNode }) {
//   const session = await getServerSession(authOptions);
//   if (!session) redirect('/login');

//   console.log('SESSION LAYOUT:', JSON.stringify(session.user));

//   return (
//     <div className="grid grid-cols-[240px_1fr] min-h-screen">
//       <AdminSidebar user={session.user} />
//       <div className="bg-bg overflow-hidden">{children}</div>
//     </div>
//   );
// }
