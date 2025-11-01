import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { TagForm } from '@/components/admin/TagForm';

export const dynamic = 'force-dynamic';

export default async function AdminNewTagPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    redirect('/admin/login');
  }

  const session = await verifyAdminSession(sessionToken);
  if (!session.valid || !session.admin) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6 py-6">
      <TagForm mode="create" />
    </div>
  );
}

