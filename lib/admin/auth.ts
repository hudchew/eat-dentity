import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; admin?: { id: string; email: string; name: string } }> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return { success: false };
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return { success: false };
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false };
  }
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create admin session
 */
export async function createAdminSession(
  adminId: string,
  expiresInHours: number = 24
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  await prisma.adminSession.create({
    data: {
      adminId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify admin session token
 */
export async function verifyAdminSession(token: string): Promise<{
  valid: boolean;
  admin?: { id: string; email: string; name: string };
}> {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!session || !session.admin.isActive) {
      return { valid: false };
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.adminSession.delete({
        where: { id: session.id },
      });
      // Also cleanup other expired sessions
      await cleanupExpiredSessions();
      return { valid: false };
    }

    return {
      valid: true,
      admin: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
      },
    };
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return { valid: false };
  }
}

/**
 * Delete admin session
 */
export async function deleteAdminSession(token: string): Promise<void> {
  try {
    await prisma.adminSession.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Error deleting admin session:', error);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.adminSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

