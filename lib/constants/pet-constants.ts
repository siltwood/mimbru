/**
 * Pet System Constants
 * Centralized configuration for all game mechanics
 */

// ============================================================================
// STAT LIMITS
// ============================================================================
export const STAT_LIMITS = {
  MIN: 0,
  MAX: 100,
} as const;

// ============================================================================
// CREATURE INITIAL VALUES
// ============================================================================
export const INITIAL_CREATURE = {
  HEALTH: 100,
  HAPPINESS: 100,
  CLEANLINESS: 100,
  HUNGER: 100,
  LEVEL: 1,
  FOOD_COUNT: 10,
  POOP_COUNT: 0,
} as const;

// ============================================================================
// STAT CHANGE VALUES
// ============================================================================

// Feeding
export const FEED_EFFECTS = {
  HUNGER_BOOST: 20,
  HAPPINESS_BOOST: 10,
  REVIVAL_HEALTH: 30, // Health when reviving a passed-out pet
} as const;

// Cleaning
export const CLEAN_EFFECTS = {
  CLEANLINESS_BOOST: 30,
  HAPPINESS_BOOST: 15,
  POOP_BONUS_CLEANLINESS: 20, // Extra cleanliness when cleaning poop
  POOP_BONUS_HAPPINESS: 10, // Extra happiness when cleaning poop (half of cleanliness bonus)
} as const;

// Petting
export const PET_EFFECTS = {
  HAPPINESS_BOOST: 15,
  HEALTH_BOOST: 5,
  COOLDOWN_MINUTES: 5, // Minutes between petting
} as const;

// Habit Completion
export const HABIT_COMPLETION_EFFECTS = {
  BASE_HAPPINESS: 10,
  BASE_HEALTH: 5,
  MAX_STREAK_BONUS: 10, // Maximum bonus from streak
  REVIVAL_MIN_HEALTH: 20, // Minimum health when reviving via habit completion
} as const;

// ============================================================================
// FOOD REWARDS (based on streak)
// ============================================================================
export const FOOD_REWARDS = {
  SHORT_STREAK: 1,   // 1-2 days
  MEDIUM_STREAK: 2,  // 3-6 days
  LONG_STREAK: 3,    // 7+ days
} as const;

export const FOOD_REWARD_THRESHOLDS = {
  MEDIUM: 3,
  LONG: 7,
} as const;

// ============================================================================
// TIME INTERVALS (in hours)
// ============================================================================
export const TIME_INTERVALS = {
  POOP_GENERATION: 24,      // Pet poops every 24 hours
  HEALTH_DECAY_CHECK: 12,   // Check for health decay every 12 hours
  DEGRADATION_INTERVAL: 1,  // Background degradation runs every 1 hour
  PET_COOLDOWN: 5 / 60,     // 5 minutes in hours
} as const;

// ============================================================================
// POOP SYSTEM
// ============================================================================
export const POOP_SYSTEM = {
  MAX_POOP_COUNT: 5,        // Maximum poop before toxic environment
  TOXIC_THRESHOLD: 5,       // Poop count that triggers toxic effects
  POOP_CLEANLINESS_PENALTY: 15, // Cleanliness lost when pet poops
} as const;

// ============================================================================
// HEALTH DECAY (when no habits completed)
// ============================================================================
export const HEALTH_DECAY = {
  BASE_HEALTH_LOSS: 20,
  BASE_HAPPINESS_LOSS: 15,
  TOXIC_HEALTH_LOSS: 35,     // When 5+ poops
  TOXIC_HAPPINESS_LOSS: 25,  // When 5+ poops
} as const;

// ============================================================================
// DEGRADATION THRESHOLDS
// ============================================================================
export const DEGRADATION_THRESHOLDS = {
  CRITICAL_STAT: 20,        // Stats below this are critical
  LOW_STAT: 30,             // Stats below this trigger penalties
  HOURS_SINCE_FEEDING: 6,   // Hunger starts degrading after this
  HOURS_SINCE_CLEANING: 12, // Cleanliness starts degrading after this
} as const;

// ============================================================================
// HABIT COMPLETION RATES (for degradation calculation)
// ============================================================================
export const COMPLETION_RATES = {
  EXCELLENT: 0.8,  // 80%+ completion
  GOOD: 0.5,       // 50%+ completion
  FAIR: 0.2,       // 20%+ completion
} as const;

// Stat changes based on completion rate
export const COMPLETION_RATE_EFFECTS = {
  EXCELLENT: {
    HEALTH: 2,
    HAPPINESS: 3,
  },
  GOOD: {
    HEALTH: 0,
    HAPPINESS: 1,
  },
  FAIR: {
    HEALTH: -3,
    HAPPINESS: -5,
  },
  POOR: {
    HEALTH: -6,
    HAPPINESS: -10,
  },
  NO_HABITS: {
    HEALTH: -2,
    HAPPINESS: -3,
  },
} as const;

// ============================================================================
// NEGLECT PENALTIES
// ============================================================================
export const NEGLECT_PENALTIES = {
  LOW_HUNGER: {
    HEALTH: -3,
    HAPPINESS: -5,
  },
  LOW_CLEANLINESS: {
    HEALTH: -2,
    HAPPINESS: -3,
  },
} as const;

// ============================================================================
// DEGRADATION RATES (hourly)
// ============================================================================
export const HOURLY_DEGRADATION = {
  MAX_HUNGER_LOSS: 10,
  MAX_CLEANLINESS_LOSS: 8,
} as const;

// ============================================================================
// STREAK TIERS
// ============================================================================
export const STREAK_TIERS = {
  SEEDLING: 1,    // 🌱
  SPARKLES: 3,    // ✨
  FIRE: 7,        // 🔥
  GEM: 14,        // 💎
  TROPHY: 30,     // 🏆
} as const;

export const STREAK_EMOJIS = {
  SEEDLING: '🌱',
  SPARKLES: '✨',
  FIRE: '🔥',
  GEM: '💎',
  TROPHY: '🏆',
} as const;

// ============================================================================
// WARNING THRESHOLDS
// ============================================================================
export const WARNING_THRESHOLDS = {
  CRITICAL_HEALTH: 20,
  VERY_SAD: 20,
  FILTHY: 20,
  STARVING: 20,
  MANY_POOPS: 3,
  TOXIC_POOPS: 5,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get food reward based on streak length
 */
export function getFoodReward(streak: number): number {
  if (streak >= FOOD_REWARD_THRESHOLDS.LONG) return FOOD_REWARDS.LONG_STREAK;
  if (streak >= FOOD_REWARD_THRESHOLDS.MEDIUM) return FOOD_REWARDS.MEDIUM_STREAK;
  return FOOD_REWARDS.SHORT_STREAK;
}

/**
 * Get streak emoji based on streak length
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= STREAK_TIERS.TROPHY) return STREAK_EMOJIS.TROPHY;
  if (streak >= STREAK_TIERS.GEM) return STREAK_EMOJIS.GEM;
  if (streak >= STREAK_TIERS.FIRE) return STREAK_EMOJIS.FIRE;
  if (streak >= STREAK_TIERS.SPARKLES) return STREAK_EMOJIS.SPARKLES;
  return STREAK_EMOJIS.SEEDLING;
}

/**
 * Calculate habit completion bonus based on streak
 */
export function getStreakBonus(streak: number): number {
  return Math.min(streak, HABIT_COMPLETION_EFFECTS.MAX_STREAK_BONUS);
}

/**
 * Check if stat is in critical range
 */
export function isCriticalStat(value: number): boolean {
  return value < WARNING_THRESHOLDS.CRITICAL_HEALTH;
}

/**
 * Clamp a stat value between MIN and MAX
 */
export function clampStat(value: number): number {
  return Math.max(STAT_LIMITS.MIN, Math.min(STAT_LIMITS.MAX, value));
}
