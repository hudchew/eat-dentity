import type { Challenge, Meal, MealTag, Tag } from '@prisma/client';
import { PERSONA_RULES } from '@/lib/constants';

export interface ChallengeWithMeals extends Challenge {
  meals: (Meal & { tags: (MealTag & { tag: Tag })[] })[];
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[]; // missing requirements
  dayNumber: number;
  totals: {
    totalMeals: number;
    activeDays: number;
    uniqueTags: number;
    distinctCategories: number;
  };
}

export function evaluateEligibility(challenge: ChallengeWithMeals): EligibilityResult {
  const now = new Date();
  const diffTime = now.getTime() - challenge.startDate.getTime();
  const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const totalMeals = challenge.meals.length;

  // Active days: count unique days with at least 1 meal
  const dayKeys = new Set<string>();
  for (const m of challenge.meals) {
    const d = new Date(m.mealTime);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayKeys.add(key);
  }
  const activeDays = dayKeys.size;

  // Unique tag slugs and categories
  const tagSlugSet = new Set<string>();
  const catSet = new Set<string>();
  for (const m of challenge.meals) {
    for (const mt of m.tags) {
      if (mt.tag?.slug) tagSlugSet.add(mt.tag.slug);
      if (mt.tag?.category) catSet.add(mt.tag.category);
    }
  }
  const uniqueTags = tagSlugSet.size;
  const distinctCategories = catSet.size;

  const reasons: string[] = [];

  if (dayNumber < 7) {
    reasons.push(`ต้องครบ 7 วัน (วันนี้วันที่ ${dayNumber}/7)`);
  }
  if (totalMeals < PERSONA_RULES.MIN_TOTAL_MEALS && activeDays < PERSONA_RULES.MIN_ACTIVE_DAYS) {
    reasons.push(
      `ต้องมีมื้อรวม ≥ ${PERSONA_RULES.MIN_TOTAL_MEALS} หรือมีอย่างน้อย 1 มื้อใน ≥ ${PERSONA_RULES.MIN_ACTIVE_DAYS} วัน`
    );
  }
  if (uniqueTags < PERSONA_RULES.MIN_UNIQUE_TAGS) {
    reasons.push(`ต้องมีแท็กไม่ซ้ำ ≥ ${PERSONA_RULES.MIN_UNIQUE_TAGS}`);
  }
  if (distinctCategories < PERSONA_RULES.MIN_DISTINCT_CATEGORIES) {
    reasons.push(`ต้องมีแท็กจากอย่างน้อย ${PERSONA_RULES.MIN_DISTINCT_CATEGORIES} หมวด`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    dayNumber,
    totals: { totalMeals, activeDays, uniqueTags, distinctCategories },
  };
}
