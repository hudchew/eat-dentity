'use server';

import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Get or create user in database from Clerk
 * This ensures user exists even if webhook hasn't fired yet
 */
export async function getOrCreateUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Please sign in');
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist, create from Clerk data
  if (!user) {
    try {
      // Get current user data from Clerk
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error('Unable to get user data from Clerk');
      }

      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || '';

      if (!primaryEmail) {
        throw new Error('No email address found in Clerk account');
      }

      // Create user in database
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        },
      });

      console.log(`✅ Auto-created user in database: ${userId} - ${primaryEmail}`);
    } catch (error: any) {
      console.error('Error creating user from Clerk:', error);
      // If user was created by webhook in the meantime (race condition)
      if (error.code === 'P2002') {
        user = await prisma.user.findUnique({
          where: { clerkId: userId },
        });
      } else {
        // Don't throw error, just return null and let webhook handle it
        console.warn('Could not auto-create user, will rely on webhook:', error.message);
        return null;
      }
    }
  }

  if (!user) {
    throw new Error('User not found. Please try signing out and signing in again.');
  }

  return user;
}

