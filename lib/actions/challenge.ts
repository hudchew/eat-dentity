'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getOrCreateUser } from './user';
import { evaluateEligibility } from '@/lib/utils/eligibility';

/**
 * Start a new 7-day challenge for the authenticated user
 * @returns The created challenge
 */
export async function startChallenge() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Please sign in to start a challenge');
  }

  // Get or create user in database
  const user = await getOrCreateUser();

  // Check if user has an active challenge
  const activeChallenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
  });

  if (activeChallenge) {
    throw new Error('You already have an active challenge. Please complete it first.');
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  // Create new challenge
  const challenge = await prisma.challenge.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/dashboard');
  return challenge;
}

/**
 * Get the active challenge for the authenticated user
 * @returns The active challenge with meals and tags, or null if none exists
 */
export async function getActiveChallenge() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  let user;
  try {
    user = await getOrCreateUser();
  } catch {
    // If user creation fails, return null (will show start challenge button)
    return null;
  }

  const challenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    include: {
      meals: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          mealTime: 'desc',
        },
      },
    },
  });

  return challenge;
}

/**
 * Save a meal with tags to the active challenge
 * @param imageUrl The URL of the uploaded image (from Vercel Blob)
 * @param tagSlugs Array of tag slugs (e.g., ['fried', 'meat'])
 * @param notes Optional notes about the meal
 * @returns The created meal
 */
export async function saveMeal(
  imageUrl: string,
  tagSlugs: string[],
  notes?: string
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Please sign in to save a meal');
  }

  // Get or create user in database
  const user = await getOrCreateUser();

  // Get active challenge
  const challenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
  });

  if (!challenge) {
    throw new Error('No active challenge found. Please start a challenge first.');
  }

  // Calculate day number (1-7)
  const now = new Date();
  const diffTime = now.getTime() - challenge.startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const dayNumber = Math.min(Math.max(diffDays, 1), 7);

  // Get tags from database
  const tags = await prisma.tag.findMany({
    where: {
      slug: {
        in: tagSlugs,
      },
    },
  });

  if (tags.length !== tagSlugs.length) {
    throw new Error('Some tags were not found. Please try again.');
  }

  // Create meal with tags
  const meal = await prisma.meal.create({
    data: {
      challengeId: challenge.id,
      imageUrl,
      mealTime: now,
      dayNumber,
      notes: notes || null,
      tags: {
        create: tags.map((tag) => ({
          tagId: tag.id,
        })),
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/capture');
  return meal;
}

/**
 * Complete the active challenge and generate persona
 * @returns The created persona
 */
export async function completeChallenge() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Please sign in to complete a challenge');
  }

  // Get or create user in database
  const user = await getOrCreateUser();

  // Get active challenge
  const challenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    include: {
      meals: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  if (!challenge) {
    throw new Error('No active challenge found.');
  }

  // Server-side eligibility guard (matches UI)
  const eligibility = evaluateEligibility(challenge as any);
  if (!eligibility.eligible) {
    throw new Error(`ยังไม่พร้อมวิเคราะห์: ${eligibility.reasons.join(' • ')}`);
  }

  // Import persona engine dynamically to avoid circular dependency
  const { calculatePersona } = await import('@/lib/persona-engine');
  const persona = await calculatePersona(challenge.id);

  // Update challenge status
  await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: 'COMPLETED' },
  });

  revalidatePath('/dashboard');
  revalidatePath('/result');
  return persona;
}

/**
 * Get the latest completed persona for the authenticated user
 * @returns The latest persona with challenge info, or null if none exists
 */
export async function getLatestPersona() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  let user;
  try {
    user = await getOrCreateUser();
  } catch {
    return null;
  }

  // Get latest completed challenge with persona
  const challenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'COMPLETED',
    },
    include: {
      persona: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return challenge?.persona || null;
}

