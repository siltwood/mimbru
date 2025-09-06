import { supabase } from "@/config/supabase";

export class CreatureDegradation {
	private static instance: CreatureDegradation;
	private interval: ReturnType<typeof setInterval> | null = null;

	private constructor() {}

	public static getInstance(): CreatureDegradation {
		if (!CreatureDegradation.instance) {
			CreatureDegradation.instance = new CreatureDegradation();
		}
		return CreatureDegradation.instance;
	}

	public startDegradation(userId: string) {
		if (this.interval) {
			clearInterval(this.interval);
		}

		// Run degradation every hour (in production, you might want this less frequent)
		this.interval = setInterval(() => {
			this.degradeCreature(userId);
		}, 60 * 60 * 1000); // 1 hour

		// Also run immediately
		this.degradeCreature(userId);
	}

	public stopDegradation() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	private async degradeCreature(userId: string) {
		try {
			const { data: creature, error } = await supabase
				.from("creatures")
				.select("*")
				.eq("user_id", userId)
				.single();

			if (error || !creature) {
				console.log("No creature found for degradation");
				return;
			}

			// Don't degrade if already dead
			if (creature.is_dead) {
				return;
			}

			const now = new Date();
			const lastFed = creature.last_fed ? new Date(creature.last_fed) : new Date(creature.created_at);
			const lastCleaned = creature.last_cleaned ? new Date(creature.last_cleaned) : new Date(creature.created_at);

			// Calculate hours since last care
			const hoursSinceFeeding = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60));
			const hoursSinceCleaning = Math.floor((now.getTime() - lastCleaned.getTime()) / (1000 * 60 * 60));

			// Check habit completion for today
			const today = new Date().toDateString();
			
			const { data: habits } = await supabase
				.from("habits")
				.select("last_completed")
				.eq("user_id", userId)
				.neq("name", "daily_checkin"); // Exclude old daily check-in records

			let completedHabitsToday = 0;
			let totalHabits = habits?.length || 0;

			if (habits) {
				completedHabitsToday = habits.filter(habit => {
					if (!habit.last_completed) return false;
					const lastCompleted = new Date(habit.last_completed).toDateString();
					return lastCompleted === today;
				}).length;
			}

			// Calculate completion percentage
			const completionRate = totalHabits > 0 ? completedHabitsToday / totalHabits : 0;

			// Calculate degradation based on habit completion
			let healthChange = 0;
			let happinessChange = 0;
			let cleanlinessChange = 0;
			let hungerChange = 0;

			// Hunger degrades over time (faster if not fed)
			if (hoursSinceFeeding > 6) {
				hungerChange = -Math.min(10, hoursSinceFeeding - 6);
			}

			// Cleanliness degrades over time
			if (hoursSinceCleaning > 12) {
				cleanlinessChange = -Math.min(8, hoursSinceCleaning - 12);
			}

			// Health and happiness based on habit completion
			if (totalHabits > 0) {
				if (completionRate >= 0.8) {
					// Great habit completion - bonus stats
					healthChange = 2;
					happinessChange = 3;
				} else if (completionRate >= 0.5) {
					// Decent completion - maintain stats
					healthChange = 0;
					happinessChange = 1;
				} else if (completionRate >= 0.2) {
					// Poor completion - slight degradation
					healthChange = -3;
					happinessChange = -5;
				} else {
					// Very poor completion - significant degradation
					healthChange = -6;
					happinessChange = -10;
				}
			} else {
				// No habits set - slight degradation
				healthChange = -2;
				happinessChange = -3;
			}

			// Additional degradation if very neglected
			if (creature.hunger < 30) {
				healthChange -= 3;
				happinessChange -= 5;
			}

			if (creature.cleanliness < 30) {
				healthChange -= 2;
				happinessChange -= 3;
				// Increase poop count
				await supabase
					.from("creatures")
					.update({ poop_count: Math.min(5, creature.poop_count + 1) })
					.eq("id", creature.id);
			}

			// Apply changes
			const newHealth = Math.max(0, creature.health + healthChange);
			const newHappiness = Math.max(0, creature.happiness + happinessChange);
			const newCleanliness = Math.max(0, creature.cleanliness + cleanlinessChange);
			const newHunger = Math.max(0, creature.hunger + hungerChange);

			// Check if creature should die
			const shouldDie = newHealth <= 0 && newHappiness <= 0;

			if (healthChange !== 0 || happinessChange !== 0 || cleanlinessChange !== 0 || hungerChange !== 0 || shouldDie) {
				await supabase
					.from("creatures")
					.update({
						health: newHealth,
						happiness: newHappiness,
						cleanliness: newCleanliness,
						hunger: newHunger,
						is_dead: shouldDie,
						current_animation: shouldDie ? "dead" : 
							(newHealth < 30 || newHappiness < 30) ? "sick" : "idle",
						updated_at: new Date().toISOString()
					})
					.eq("id", creature.id);

				// Log the degradation
				if (healthChange !== 0 || happinessChange !== 0) {
					await supabase.from("pet_actions").insert([
						{
							user_id: userId,
							action_type: "degradation",
							health_effect: healthChange,
							happiness_effect: happinessChange,
							cleanliness_effect: cleanlinessChange,
							hunger_effect: hungerChange
						}
					]);
				}

				console.log(`Creature degraded: H${healthChange} Ha${happinessChange} C${cleanlinessChange} Hu${hungerChange} (${completedHabitsToday}/${totalHabits} habits)`);
			}

		} catch (error) {
			console.error("Error in creature degradation:", error);
		}
	}

	public async manualDegrade(userId: string) {
		await this.degradeCreature(userId);
	}
} 