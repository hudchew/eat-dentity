/**
 * Persona analysis thresholds (from project-brain/rules.md)
 * These rules determine when a user is eligible to generate their persona
 */
export const PERSONA_RULES = {
  MIN_TOTAL_MEALS: 10,
  MIN_ACTIVE_DAYS: 5,
  MIN_UNIQUE_TAGS: 5,
  MIN_DISTINCT_CATEGORIES: 2,
  MAX_MEALS_PER_DAY_COUNTED: 3, // used for weighting, not gating
} as const;

