import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/admin/auth';
import { getAdminSession } from '@/lib/admin/middleware';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    const sessionToken = req.cookies.get('admin_session')?.value;

    if (sessionToken) {
      await deleteAdminSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
    response.cookies.delete('admin_session');
    return response;
  }
}

