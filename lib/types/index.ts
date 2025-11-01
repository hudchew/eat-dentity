/**
 * Shared type definitions
 * Centralized location for commonly used types across the application
 */

// Re-export Prisma types for convenience
export type { User, Challenge, Meal, Tag, MealTag, Persona, Status } from '@prisma/client';

// QuickTag interface (from constants)
export interface QuickTag {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  category: 'COOKING_METHOD' | 'FOOD_GROUP' | 'TASTE' | 'BEVERAGE';
}

// Meal Period types (from meal-period util)
export type MealPeriod = 'late-night' | 'breakfast' | 'late-morning' | 'lunch' | 'afternoon' | 'dinner' | 'late-evening';

export interface MealPrompt {
  period: MealPeriod;
  title: string;
  subtitle: string;
  emoji: string;
}

// Eligibility types (from eligibility util)
export interface ChallengeWithMeals {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  meals: Array<{
    id: string;
    challengeId: string;
    imageUrl: string;
    mealTime: Date;
    dayNumber: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    tags: Array<{
      mealId: string;
      tagId: string;
      tag: {
        id: string;
        name: string;
        slug: string;
        emoji: string;
        color: string;
        category: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
  }>;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  dayNumber: number;
  totals: {
    totalMeals: number;
    activeDays: number;
    uniqueTags: number;
    distinctCategories: number;
  };
}

// Persona types (from persona-engine)
export interface PersonaResult {
  title: string;
  description: string;
  emoji: string;
  stats: Record<string, number>;
}

// Persona display format (from persona util)
export interface PersonaDisplay {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  stats: {
    fried: number;
    vegetables: number;
    meat: number;
    carbs: number;
    dessert: number;
    coffee: number;
  };
  powers: {
    attack: { label: string; value: string; emoji: string };
    defense: { label: string; value: string; emoji: string };
    speed: { label: string; value: string; emoji: string };
  };
  aiInsight: string;
}

