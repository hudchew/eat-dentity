import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './auth';

/**
 * Get admin session from cookie
 */
export async function getAdminSession(req: NextRequest): Promise<{
  valid: boolean;
  admin?: { id: string; email: string; name: string };
}> {
  const sessionToken = req.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    return { valid: false };
  }

  return await verifyAdminSession(sessionToken);
}

/**
 * Middleware helper to protect admin routes
 */
export async function requireAdmin(req: NextRequest): Promise<{
  authorized: boolean;
  admin?: { id: string; email: string; name: string };
  response?: NextResponse;
}> {
  const session = await getAdminSession(req);

  if (!session.valid || !session.admin) {
    const response = NextResponse.redirect(new URL('/admin/login', req.url));
    response.cookies.delete('admin_session');
    return {
      authorized: false,
      response,
    };
  }

  return {
    authorized: true,
    admin: session.admin,
  };
}

