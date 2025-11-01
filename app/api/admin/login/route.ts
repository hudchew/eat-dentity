import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession } from '@/lib/admin/auth';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';
import { getRateLimitKey, checkRateLimit } from '@/lib/admin/rate-limit';

// Login schema for validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const rateLimitKey = getRateLimitKey('login', ip);
    const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 15); // 5 attempts per 15 minutes

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Input validation
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    // Verify credentials
    const result = await verifyAdminCredentials(email, password);

    // Generic error message (ไม่บอกว่า email หรือ password ผิด)
    if (!result.success || !result.admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createAdminSession(result.admin.id, 24); // 24 hours

    // Log activity
    await logAdminActivity({
      adminId: result.admin.id,
      action: 'VIEW',
      entityType: 'Admin',
      entityId: result.admin.id,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // Set cookie
    // Don't expose admin data in response
    const response = NextResponse.json({
      success: true,
    });

    // Set httpOnly cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

