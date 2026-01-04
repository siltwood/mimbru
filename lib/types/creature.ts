/**
 * Shared type definitions for the pet/creature system
 */

export type Creature = {
	id: string;
	user_id: string;
	name: string;
	level: number;
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
	food_count: number;
	poop_count: number;
	is_dead: boolean;
	current_animation: string;
	last_fed: string;
	last_cleaned: string;
	last_pet_time: string | null;
	last_poop_time: string | null;
	last_health_decay: string | null;
	created_at: string;
	updated_at: string;
};

export type AnimationState =
	| 'idle'
	| 'walking_up'
	| 'walking_down'
	| 'walking_left'
	| 'walking_right'
	| 'happy'
	| 'sad'
	| 'eating'
	| 'sleeping'
	| 'dead';

export type CreatureStats = Pick<Creature, 'health' | 'happiness' | 'cleanliness' | 'hunger'>;
