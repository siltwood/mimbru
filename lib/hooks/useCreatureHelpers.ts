import {
	DEGRADATION_THRESHOLDS,
	WARNING_THRESHOLDS,
} from '@/lib/constants/pet-constants';

type Creature = {
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
	is_dead: boolean;
	poop_count: number;
};

export function useCreatureHelpers() {
	const getAnimationState = (creature: Creature) => {
		if (creature.is_dead) return 'dead'; // Passed out state
		if (creature.health < DEGRADATION_THRESHOLDS.LOW_STAT || creature.happiness < DEGRADATION_THRESHOLDS.LOW_STAT) return 'sad';
		if (creature.happiness > 80) return 'happy';
		if (creature.hunger < DEGRADATION_THRESHOLDS.CRITICAL_STAT) return 'eating';
		// The SpritePet component will handle walking directions automatically
		return 'idle';
	};

	const getUrgentWarnings = (creature: Creature) => {
		const warnings = [];
		if (creature.is_dead) warnings.push("😵 Pet has passed out! Feed or complete habits to revive!");
		else if (creature.poop_count >= WARNING_THRESHOLDS.TOXIC_POOPS) warnings.push("☠️ TOXIC! Too much poop is harming your pet!");
		else if (creature.poop_count >= WARNING_THRESHOLDS.MANY_POOPS) warnings.push("💩 Your pet is surrounded by poop!");
		if (!creature.is_dead && creature.health < WARNING_THRESHOLDS.CRITICAL_HEALTH) warnings.push("⚠️ Health critically low - risk of passing out!");
		if (creature.happiness < WARNING_THRESHOLDS.VERY_SAD) warnings.push("😢 Pet is very sad!");
		if (creature.cleanliness < WARNING_THRESHOLDS.FILTHY) warnings.push("🤢 Pet is filthy!");
		if (creature.hunger < WARNING_THRESHOLDS.STARVING) warnings.push("🍎 Pet is starving!");
		return warnings;
	};

	return {
		getAnimationState,
		getUrgentWarnings,
	};
}
