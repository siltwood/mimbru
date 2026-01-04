import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';
import { INITIAL_CREATURE } from '@/lib/constants/pet-constants';
import { Creature } from '@/lib/types/creature';

export function useCreature(userId: string | undefined, signOut: () => Promise<void>) {
	const [creature, setCreature] = useState<Creature | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchOrCreateCreature = async () => {
		if (!userId) return;

		try {
			const { data, error } = await supabase
				.from("creatures")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(1);

			if (error) {
				console.error("Error fetching creature:", error);
			} else if (!data || data.length === 0) {
				// No creature found, create one
				await createCreature();
			} else {
				setCreature(data[0]);
			}
		} catch (err) {
			console.error("Error:", err);
		} finally {
			setLoading(false);
		}
	};

	const createCreature = async () => {
		if (!userId) return;

		try {
			const now = new Date().toISOString();
			const { data, error } = await supabase
				.from("creatures")
				.insert([
					{
						user_id: userId,
						name: "Habito",
						health: INITIAL_CREATURE.HEALTH,
						happiness: INITIAL_CREATURE.HAPPINESS,
						cleanliness: INITIAL_CREATURE.CLEANLINESS,
						hunger: INITIAL_CREATURE.HUNGER,
						level: INITIAL_CREATURE.LEVEL,
						is_dead: false,
						current_animation: "idle",
						last_poop_time: now,
						last_pet_time: null,
						last_health_decay: now,
						food_count: INITIAL_CREATURE.FOOD_COUNT,
						poop_count: INITIAL_CREATURE.POOP_COUNT
					}
				])
				.select()
				.single();

			if (error) {
				console.error("Error creating creature:", error);
				// If creation fails due to unique constraint (user already has a creature),
				// try to fetch the existing creature instead
				if (error.code === '23505') { // PostgreSQL unique violation error
					if (__DEV__) console.log("Creature already exists for user, fetching existing one...");
					await fetchOrCreateCreature();
				}
				// If user doesn't exist (orphaned session), sign out
				else if (error.code === '23503' && error.message.includes('user_id')) {
					if (__DEV__) console.log("User no longer exists, signing out...");
					Alert.alert(
						"Account Not Found",
						"Your account was deleted. Please sign in again.",
						[{ text: "OK", onPress: () => signOut() }]
					);
					return;
				}
			} else {
				setCreature(data);
			}
		} catch (err) {
			console.error("Error creating creature:", err);
		}
	};

	return {
		creature,
		setCreature,
		loading,
		fetchOrCreateCreature,
	};
}
