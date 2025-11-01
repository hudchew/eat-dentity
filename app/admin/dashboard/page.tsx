import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    redirect('/admin/login');
  }

  const session = await verifyAdminSession(sessionToken);
  if (!session.valid || !session.admin) {
    redirect('/admin/login');
  }

  // Get statistics
  const [totalUsers, totalChallenges, totalMeals, totalPersonas] = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.meal.count(),
    prisma.persona.count(),
  ]);

  const activeChallenges = await prisma.challenge.count({
    where: { status: 'ACTIVE' },
  });

  const completedChallenges = await prisma.challenge.count({
    where: { status: 'COMPLETED' },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.admin.name}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalChallenges}</div>
            <div className="text-sm text-gray-500 mt-1">
              Active: {activeChallenges} • Completed: {completedChallenges}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalMeals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">{totalPersonas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/users" className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="font-medium">👥 Manage Users</div>
              <div className="text-sm text-gray-500">View and edit user accounts</div>
            </a>
            <a href="/admin/challenges" className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="font-medium">🎯 Manage Challenges</div>
              <div className="text-sm text-gray-500">View and manage challenges</div>
            </a>
            <a href="/admin/tags" className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="font-medium">🏷️ Manage Tags</div>
              <div className="text-sm text-gray-500">Edit food tags</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

