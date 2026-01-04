import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';
import {
	FEED_EFFECTS,
	CLEAN_EFFECTS,
	PET_EFFECTS,
	clampStat,
} from '@/lib/constants/pet-constants';
import { Creature } from '@/lib/types/creature';

export function useCreatureActions(
	userId: string | undefined,
	creature: Creature | null,
	setCreature: (creature: Creature) => void,
	showFloatingAnimation: (text: string) => void
) {
	const feedCreature = async () => {
		if (!creature || !userId) return;

		// Check if player has food
		if (creature.food_count <= 0) {
			Alert.alert("🍎 No Food!", "Complete habits to earn food for your pet!");
			return;
		}

		const newHunger = clampStat(creature.hunger + FEED_EFFECTS.HUNGER_BOOST);
		const newHappiness = clampStat(creature.happiness + FEED_EFFECTS.HAPPINESS_BOOST);
		let newHealth = creature.health;

		// If pet is dead, revive it with feeding
		const updates: Partial<Creature> & { updated_at: string } = {
			hunger: newHunger,
			happiness: newHappiness,
			food_count: creature.food_count - 1, // Consume 1 food
			last_fed: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		if (creature.is_dead) {
			updates.health = FEED_EFFECTS.REVIVAL_HEALTH;
			updates.is_dead = false;
			updates.current_animation = "idle";
			newHealth = FEED_EFFECTS.REVIVAL_HEALTH;
		}

		try {
			const { error } = await supabase
				.from("creatures")
				.update(updates)
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					...updates,
					health: newHealth
				});

				// Log the action
				await supabase.from("pet_actions").insert([
					{
						user_id: userId,
						action_type: creature.is_dead ? "revival_feeding" : "feed",
						hunger_effect: FEED_EFFECTS.HUNGER_BOOST,
						happiness_effect: FEED_EFFECTS.HAPPINESS_BOOST,
						health_effect: creature.is_dead ? FEED_EFFECTS.REVIVAL_HEALTH : 0
					}
				]);

				if (creature.is_dead) {
					Alert.alert("🌟 Revived!", "Your pet woke up! The food gave it energy to continue.");
					showFloatingAnimation("✨ AWAKE! ✨");
				} else {
					const feedMessages = ["😋 Yummy!", "🍎 Delicious!", "😍 Om nom nom!", "🤤 So tasty!"];
					const randomMessage = feedMessages[Math.floor(Math.random() * feedMessages.length)];
					Alert.alert("🍎", "Your pet loved the food!");
					showFloatingAnimation(randomMessage);
				}
			}
		} catch (err) {
			console.error("Error feeding creature:", err);
		}
	};

	const cleanCreature = async () => {
		if (!creature || !userId) return;

		// Can't clean a passed out creature
		if (creature.is_dead) {
			Alert.alert("😵", "Your pet is passed out! Feed it to revive or complete habits to earn food.");
			return;
		}

		const poopBonus = creature.poop_count > 0 ? CLEAN_EFFECTS.POOP_BONUS_CLEANLINESS : 0;
		const happinessPoopBonus = creature.poop_count > 0 ? CLEAN_EFFECTS.POOP_BONUS_HAPPINESS : 0;
		const newCleanliness = clampStat(creature.cleanliness + CLEAN_EFFECTS.CLEANLINESS_BOOST + poopBonus);
		const newHappiness = clampStat(creature.happiness + CLEAN_EFFECTS.HAPPINESS_BOOST + happinessPoopBonus);

		try {
			const { error } = await supabase
				.from("creatures")
				.update({
					cleanliness: newCleanliness,
					happiness: newHappiness,
					last_cleaned: new Date().toISOString(),
					poop_count: 0, // Clean all poop
					updated_at: new Date().toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					cleanliness: newCleanliness,
					happiness: newHappiness,
					last_cleaned: new Date().toISOString(),
					poop_count: 0
				});

				// Log the action
				await supabase.from("pet_actions").insert([
					{
						user_id: userId,
						action_type: "clean",
						cleanliness_effect: CLEAN_EFFECTS.CLEANLINESS_BOOST + poopBonus,
						happiness_effect: CLEAN_EFFECTS.HAPPINESS_BOOST + happinessPoopBonus
					}
				]);

				if (creature.poop_count > 0) {
					Alert.alert("🧼💩", "You cleaned up all the poop! Your pet is squeaky clean and much happier!");
					showFloatingAnimation("✨ SPARKLE CLEAN! ✨");
				} else {
					Alert.alert("🧼", "Your pet is squeaky clean!");
					showFloatingAnimation("🧼 So fresh!");
				}
			}
		} catch (err) {
			console.error("Error cleaning creature:", err);
		}
	};

	const petCreature = async () => {
		if (!creature || !userId) return;

		// Can't pet a passed out creature
		if (creature.is_dead) {
			Alert.alert("😵", "Your pet is passed out! Feed it to revive or complete habits to earn food.");
			return;
		}

		const now = new Date();
		const lastPetTime = creature.last_pet_time ? new Date(creature.last_pet_time) : null;

		// Cooldown to prevent spam
		if (lastPetTime) {
			const minutesSinceLastPet = (now.getTime() - lastPetTime.getTime()) / (1000 * 60);
			if (minutesSinceLastPet < PET_EFFECTS.COOLDOWN_MINUTES) {
				const minutesLeft = Math.ceil(PET_EFFECTS.COOLDOWN_MINUTES - minutesSinceLastPet);
				Alert.alert("😴", `Your pet is tired! Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`);
				return;
			}
		}

		const newHappiness = clampStat(creature.happiness + PET_EFFECTS.HAPPINESS_BOOST);
		const newHealth = clampStat(creature.health + PET_EFFECTS.HEALTH_BOOST);

		try {
			const { error } = await supabase
				.from("creatures")
				.update({
					happiness: newHappiness,
					health: newHealth,
					last_pet_time: now.toISOString(),
					updated_at: now.toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					happiness: newHappiness,
					health: newHealth,
					last_pet_time: now.toISOString()
				});

				// Log the action
				await supabase.from("pet_actions").insert([
					{
						user_id: userId,
						action_type: "pet",
						happiness_effect: PET_EFFECTS.HAPPINESS_BOOST,
						health_effect: PET_EFFECTS.HEALTH_BOOST
					}
				]);

				const messages = [
					"Your pet loves the attention! 🥰",
					"Purr purr... your pet is so happy! 😸",
					"Your pet nuzzles against your hand! 💕",
					"Your bond grows stronger! ✨",
				];
				const floatingMessages = ["💕 Love!", "🥰 Happy!", "✨ Bonding!", "😊 Joy!", "💖 Bliss!"];
				const randomFloating = floatingMessages[Math.floor(Math.random() * floatingMessages.length)];

				Alert.alert("😍", messages[Math.floor(Math.random() * messages.length)]);
				showFloatingAnimation(randomFloating);
			}
		} catch (err) {
			console.error("Error petting creature:", err);
		}
	};

	return {
		feedCreature,
		cleanCreature,
		petCreature,
	};
}
