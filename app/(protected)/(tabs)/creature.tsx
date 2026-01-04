import React, { useEffect, useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

// New Components
import { PetDisplay } from "@/components/creature/PetDisplay";
import { StatBars } from "@/components/creature/StatBars";
import { ActionButtons } from "@/components/creature/ActionButtons";
import { WarningBanner } from "@/components/creature/WarningBanner";
import { DevControls } from "@/components/creature/DevControls";

// New Hooks
import { useCreature } from "@/lib/hooks/useCreature";
import { useCreatureActions } from "@/lib/hooks/useCreatureActions";
import { useCreatureHelpers } from "@/lib/hooks/useCreatureHelpers";

// Constants
import {
	POOP_SYSTEM,
	HEALTH_DECAY,
	TIME_INTERVALS,
	INITIAL_CREATURE,
	clampStat,
} from "@/lib/constants/pet-constants";
import { Creature } from "@/lib/types/creature";
import { shouldShowDevControls, shouldShowMovementTest } from "@/config/dev-config";

export default function CreatureScreen() {
	const { session, signOut } = useAuth();
	const [floatingText, setFloatingText] = useState<string | null>(null);
	const [forceMove, setForceMove] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
	const [forceState, setForceState] = useState<'idle' | 'happy' | 'sad' | 'eating' | 'sleeping' | 'dead' | null>(null);
	const [testRunning, setTestRunning] = useState(false);
	const [testLabel, setTestLabel] = useState<string | null>(null);

	// Custom hooks
	const { creature, setCreature, loading, fetchOrCreateCreature } = useCreature(session?.user.id, signOut);
	const { getAnimationState, getUrgentWarnings } = useCreatureHelpers();

	const showFloatingAnimation = (text: string) => {
		setFloatingText(text);
		setTimeout(() => setFloatingText(null), 2000);
	};

	const { feedCreature, cleanCreature, petCreature } = useCreatureActions(
		session?.user.id,
		creature,
		setCreature,
		showFloatingAnimation
	);

	useEffect(() => {
		if (session?.user) {
			fetchOrCreateCreature();
		}
	}, [session]);

	// Refresh creature data when screen comes into focus and check for decay
	useFocusEffect(
		React.useCallback(() => {
			if (session?.user) {
				fetchOrCreateCreature();
				// Check for automatic updates every time screen is focused
				setTimeout(() => {
					checkForAutomaticUpdates();
				}, 1000);
			}
		}, [session])
	);

	// Check for automatic updates (poop generation, health decay)
	const checkForAutomaticUpdates = async () => {
		if (!creature || creature.is_dead) return;

		const now = new Date();
		const updates: Partial<Creature> = {};
		let needsUpdate = false;

		// Check for daily poop generation
		const lastPoop = creature.last_poop_time ? new Date(creature.last_poop_time) : new Date(creature.created_at);
		const hoursSinceLastPoop = (now.getTime() - lastPoop.getTime()) / (1000 * 60 * 60);

		if (hoursSinceLastPoop >= TIME_INTERVALS.POOP_GENERATION) {
			updates.poop_count = Math.min(POOP_SYSTEM.MAX_POOP_COUNT, creature.poop_count + 1);
			updates.last_poop_time = now.toISOString();
			updates.cleanliness = Math.max(0, creature.cleanliness - POOP_SYSTEM.POOP_CLEANLINESS_PENALTY);
			needsUpdate = true;
		}

		// Check for health decay (every 12 hours if no habits completed recently)
		const lastDecay = creature.last_health_decay ? new Date(creature.last_health_decay) : new Date(creature.created_at);
		const hoursSinceLastDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);

		if (hoursSinceLastDecay >= TIME_INTERVALS.HEALTH_DECAY_CHECK) {
			// Check if user completed any habits in the last 24 hours
			const { data: recentHabits } = await supabase
				.from("habits")
				.select("last_completed")
				.eq("user_id", session?.user.id);

			const hasRecentHabitActivity = recentHabits?.some(habit => {
				if (!habit.last_completed) return false;
				const habitTime = new Date(habit.last_completed);
				const hoursAgo = (now.getTime() - habitTime.getTime()) / (1000 * 60 * 60);
				return hoursAgo <= 24;
			});

			if (!hasRecentHabitActivity) {
				// Base decay amounts
				let healthDecay: number = HEALTH_DECAY.BASE_HEALTH_LOSS;
				let happinessDecay: number = HEALTH_DECAY.BASE_HAPPINESS_LOSS;

				// Increased decay when surrounded by poop (toxic environment)
				if (creature.poop_count >= POOP_SYSTEM.TOXIC_THRESHOLD) {
					healthDecay = HEALTH_DECAY.TOXIC_HEALTH_LOSS;
					happinessDecay = HEALTH_DECAY.TOXIC_HAPPINESS_LOSS;
				}

				updates.health = Math.max(0, creature.health - healthDecay);
				updates.happiness = Math.max(0, creature.happiness - happinessDecay);
				updates.last_health_decay = now.toISOString();
				needsUpdate = true;

				// Check if pet should pass out from health loss
				if (updates.health <= 0) {
					updates.is_dead = true;
					updates.current_animation = "dead";
				}
			} else {
				updates.last_health_decay = now.toISOString();
				needsUpdate = true;
			}
		}

		// Apply updates if needed
		if (needsUpdate) {
			try {
				const { error } = await supabase
					.from("creatures")
					.update(updates)
					.eq("id", creature.id);

				if (!error) {
					setCreature({ ...creature, ...updates });
				}
			} catch (err) {
				console.error("Error updating creature:", err);
			}
		}
	};

	// DEV TESTING FUNCTIONS
	const forcePooping = async () => {
		if (!creature) return;

		const newPoopCount = Math.min(10, creature.poop_count + 1);
		const newCleanliness = Math.max(0, creature.cleanliness - POOP_SYSTEM.POOP_CLEANLINESS_PENALTY);

		try {
			const { error } = await supabase
				.from("creatures")
				.update({
					poop_count: newPoopCount,
					cleanliness: newCleanliness,
					last_poop_time: new Date().toISOString(),
					updated_at: new Date().toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					poop_count: newPoopCount,
					cleanliness: newCleanliness,
					last_poop_time: new Date().toISOString()
				});
				Alert.alert("💩", "Your pet pooped! (Test mode)");
				showFloatingAnimation("💩 Oops!");
			}
		} catch (err) {
			console.error("Error forcing poop:", err);
		}
	};

	const forceFainting = async () => {
		if (!creature) return;

		try {
			const { error } = await supabase
				.from("creatures")
				.update({
					health: 0,
					happiness: Math.max(0, creature.happiness - 30),
					is_dead: true,
					current_animation: "dead",
					updated_at: new Date().toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					health: 0,
					happiness: Math.max(0, creature.happiness - 30),
					is_dead: true,
					current_animation: "dead"
				});
				Alert.alert("😵", "Your pet passed out! (Test mode)");
				showFloatingAnimation("😵 Passed out!");
			}
		} catch (err) {
			console.error("Error forcing faint:", err);
		}
	};

	const adjustStat = async (stat: 'health' | 'happiness' | 'cleanliness' | 'hunger', delta: number) => {
		if (!creature) return;

		const newValue = clampStat(creature[stat] + delta);
		const updates: Partial<typeof creature> & { updated_at: string } = {
			[stat]: newValue,
			updated_at: new Date().toISOString()
		};

		// If health goes to 0, make pet pass out
		if (stat === 'health' && newValue === 0) {
			updates.is_dead = true;
			updates.current_animation = "dead";
		} else if (stat === 'health' && newValue > 0 && creature.is_dead) {
			updates.is_dead = false;
			updates.current_animation = "idle";
		}

		try {
			const { error } = await supabase
				.from("creatures")
				.update(updates)
				.eq("id", creature.id);

			if (!error) {
				setCreature({ ...creature, ...updates });
			}
		} catch (err) {
			console.error("Error adjusting stat:", err);
		}
	};

	const adjustFood = async (delta: number) => {
		if (!creature) return;

		const newFoodCount = Math.max(0, creature.food_count + delta);

		try {
			await supabase
				.from("creatures")
				.update({ food_count: newFoodCount })
				.eq("id", creature.id);

			setCreature({ ...creature, food_count: newFoodCount });
		} catch (err) {
			console.error("Error adjusting food:", err);
		}
	};

	const resetAllStats = async () => {
		if (!creature) return;

		try {
			const { error } = await supabase
				.from("creatures")
				.update({
					health: INITIAL_CREATURE.HEALTH,
					happiness: INITIAL_CREATURE.HAPPINESS,
					cleanliness: INITIAL_CREATURE.CLEANLINESS,
					hunger: INITIAL_CREATURE.HUNGER,
					poop_count: INITIAL_CREATURE.POOP_COUNT,
					food_count: INITIAL_CREATURE.FOOD_COUNT,
					is_dead: false,
					current_animation: "idle",
					updated_at: new Date().toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					health: INITIAL_CREATURE.HEALTH,
					happiness: INITIAL_CREATURE.HAPPINESS,
					cleanliness: INITIAL_CREATURE.CLEANLINESS,
					hunger: INITIAL_CREATURE.HUNGER,
					poop_count: INITIAL_CREATURE.POOP_COUNT,
					food_count: INITIAL_CREATURE.FOOD_COUNT,
					is_dead: false,
					current_animation: "idle"
				});
				Alert.alert("✨", "All stats reset to 100! (Test mode)");
			}
		} catch (err) {
			console.error("Error resetting stats:", err);
		}
	};

	const runMovementTest = async () => {
		if (testRunning) return;
		setTestRunning(true);

		// Center pet first
		setTestLabel('Centering...');
		setForceMove('center' as any);
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Test walking directions
		const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down'];
		for (const dir of directions) {
			setTestLabel(`Walk: ${dir.toUpperCase()}`);
			setForceMove(dir);
			await new Promise(resolve => setTimeout(resolve, 3000));
		}
		setForceMove(null);

		// Test other states
		const states: ('idle' | 'happy' | 'sad' | 'eating' | 'sleeping' | 'dead')[] = ['idle', 'happy', 'sad', 'eating', 'sleeping', 'dead'];
		for (const state of states) {
			setTestLabel(`State: ${state.toUpperCase()}`);
			setForceState(state);
			await new Promise(resolve => setTimeout(resolve, 3500));
		}

		setForceState(null);
		setTestLabel(null);
		setTestRunning(false);
	};

	// Loading state
	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text>Loading your pet...</Text>
			</View>
		);
	}

	// Error state
	if (!creature) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text>Error loading creature</Text>
				<Button onPress={fetchOrCreateCreature}>
					<Text>Create New Pet</Text>
				</Button>
			</View>
		);
	}

	const urgentWarnings = getUrgentWarnings(creature);
	const animationState = forceState ?? getAnimationState(creature);

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4">
				<H1 className="text-center mb-4">🐾 {creature.name || "Your Pet"}</H1>

				{/* Urgent Warnings */}
				<WarningBanner warnings={urgentWarnings} />

				{/* Movement Test (Dev Only) */}
				{shouldShowMovementTest() && (
					<View className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
						<Button
							onPress={runMovementTest}
							variant="outline"
							className="border-blue-400"
							disabled={testRunning}
						>
							<Text className="text-blue-700 font-bold">
								{testRunning ? testLabel : '🎮 Run Movement Test'}
							</Text>
						</Button>
					</View>
				)}

				{/* Pet Display */}
				<PetDisplay
					creature={creature}
					animationState={animationState}
					onPetPress={petCreature}
					floatingText={floatingText}
					forceMove={forceMove}
				/>

				{/* Food Counter */}
				<View className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
					<Text className="text-center text-yellow-800 font-bold">
						🍎 Food: {creature.food_count}
					</Text>
					<Text className="text-center text-xs text-yellow-600 mt-1">
						Complete habits to earn more food!
					</Text>
				</View>

				{/* Health Bars */}
				<StatBars
					health={creature.health}
					happiness={creature.happiness}
					cleanliness={creature.cleanliness}
					hunger={creature.hunger}
				/>

				{/* Action Buttons */}
				<ActionButtons
					isDead={creature.is_dead}
					foodCount={creature.food_count}
					poopCount={creature.poop_count}
					onFeed={feedCreature}
					onClean={cleanCreature}
					onPet={petCreature}
				/>

				{/* Dev Controls */}
				<DevControls
					creature={creature}
					onForcePoop={forcePooping}
					onForceFaint={forceFainting}
					onAdjustStat={adjustStat}
					onAdjustFood={adjustFood}
					onResetStats={resetAllStats}
				/>

				{/* Stats Info */}
				<View className="bg-gray-50 p-3 rounded-lg mt-4">
					<Text className="text-center text-sm text-gray-600 mb-1">
						📊 Level {creature.level} • Created {new Date(creature.created_at).toLocaleDateString()}
					</Text>
					<Text className="text-center text-xs text-gray-500">
						💡 Complete habits daily to earn food and keep your pet healthy!
					</Text>
				</View>

				{/* User Account Info & Logout */}
				<View className="bg-blue-50 p-3 rounded-lg mt-4 border border-blue-200">
					<Text className="text-center text-sm text-blue-800 mb-2">
						👤 {session?.user?.email || 'Logged in'}
					</Text>
					<Button
						onPress={async () => {
							Alert.alert(
								"Sign Out",
								"Are you sure you want to sign out?",
								[
									{ text: "Cancel", style: "cancel" },
									{
										text: "Sign Out",
										style: "destructive",
										onPress: () => signOut()
									}
								]
							);
						}}
						variant="outline"
						className="border-red-300"
					>
						<Text className="text-red-600">🚪 Sign Out</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
