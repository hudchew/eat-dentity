import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  // Allow login page without authentication
  // All other admin pages will check authentication in their components
  if (!sessionToken) {
    return <>{children}</>;
  }

  const session = await verifyAdminSession(sessionToken);

  if (!session.valid || !session.admin) {
    // Clear invalid session
    cookieStore.delete('admin_session');
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AdminSidebar admin={session.admin} />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

