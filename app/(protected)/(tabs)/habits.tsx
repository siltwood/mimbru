import React, { useEffect, useState } from "react";
import { View, Alert, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
	HABIT_COMPLETION_EFFECTS,
	getFoodReward,
	getStreakEmoji,
	getStreakBonus,
} from "@/lib/constants/pet-constants";
import { Creature } from "@/lib/types/creature";

type Habit = {
	id: string;
	user_id: string;
	name: string;
	current_streak: number;
	longest_streak: number;
	total_completions: number;
	last_completed: string | null;
	created_at: string;
	updated_at: string;
};

export default function HabitsScreen() {
	const { session } = useAuth();
	const [habits, setHabits] = useState<Habit[]>([]);
	const [newHabitName, setNewHabitName] = useState("");
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);

	useFocusEffect(
		React.useCallback(() => {
			if (session?.user) {
				fetchHabits();
			}
		}, [session])
	);

	const fetchHabits = async () => {
		try {
			const { data: habitsData } = await supabase
				.from("habits")
				.select("*")
				.eq("user_id", session?.user.id)
				.neq("name", "daily_checkin") // Exclude the old daily check-in record
				.order("created_at", { ascending: true });

			setHabits(habitsData || []);
		} catch (err) {
			console.error("Error fetching habits:", err);
		} finally {
			setLoading(false);
		}
	};

	const addHabit = async () => {
		if (!newHabitName.trim()) {
			Alert.alert("Error", "Please enter a habit name");
			return;
		}

		try {
			const now = new Date().toISOString();
			const { data, error } = await supabase
				.from("habits")
				.insert([{
					user_id: session?.user.id,
					name: newHabitName.trim(),
					current_streak: 0,
					longest_streak: 0,
					total_completions: 0,
					created_at: now,
					updated_at: now
				}])
				.select()
				.single();

			if (error) throw error;

			setHabits(prev => [...prev, data]);
			setNewHabitName("");
			setShowAddForm(false);
		} catch (err) {
			console.error("Error adding habit:", err);
			Alert.alert("Error", "Failed to add habit");
		}
	};

	const completeHabit = async (habit: Habit) => {
		const today = new Date().toDateString();
		const lastCompleted = habit.last_completed ? new Date(habit.last_completed).toDateString() : null;

		if (lastCompleted === today) {
			Alert.alert("Already completed", "You've already completed this habit today!");
			return;
		}

		try {
			const now = new Date().toISOString();
			let newStreak = 1;

			// Calculate streak
			if (habit.last_completed) {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);

				if (lastCompleted === yesterday.toDateString()) {
					// Consecutive day
					newStreak = habit.current_streak + 1;
				} else {
					// Streak broken, reset to 1
					newStreak = 1;
				}
			}

			const newLongestStreak = Math.max(habit.longest_streak, newStreak);
			const newTotalCompletions = habit.total_completions + 1;

			// Update habit
			const { error } = await supabase
				.from("habits")
				.update({
					last_completed: now,
					current_streak: newStreak,
					longest_streak: newLongestStreak,
					total_completions: newTotalCompletions,
					updated_at: now
				})
				.eq("id", habit.id);

			if (error) throw error;

			// Calculate food reward based on streak (used for both DB update and alert)
			const foodReward = getFoodReward(newStreak);

			// Boost pet stats
			const { data: creature } = await supabase
				.from("creatures")
				.select("*")
				.eq("user_id", session?.user.id)
				.single();

			if (creature) {
				const streakBonus = getStreakBonus(newStreak);

				// Calculate new stats with bonus
				let newHappiness = Math.min(100, creature.happiness + HABIT_COMPLETION_EFFECTS.BASE_HAPPINESS + streakBonus);
				let newHealth = Math.min(100, creature.health + HABIT_COMPLETION_EFFECTS.BASE_HEALTH + streakBonus);
				let newHunger = creature.hunger;

				// Ensure minimum floors after habit completion - pet shouldn't feel like shit after checking in
				const MIN_HEALTH = 60;
				const MIN_HAPPINESS = 70;
				const MIN_HUNGER = 50;

				newHealth = Math.max(newHealth, MIN_HEALTH);
				newHappiness = Math.max(newHappiness, MIN_HAPPINESS);
				newHunger = Math.max(newHunger, MIN_HUNGER);

				const newFoodCount = creature.food_count + foodReward;

				const updates: Partial<Creature> & { updated_at: string } = {
					happiness: newHappiness,
					health: newHealth,
					hunger: newHunger,
					food_count: newFoodCount,
					updated_at: now
				};
				
				// If pet is passed out, revive it when completing habits
				if (creature.is_dead) {
					updates.is_dead = false;
					updates.current_animation = "idle";
					updates.health = Math.max(HABIT_COMPLETION_EFFECTS.REVIVAL_MIN_HEALTH, newHealth); // Ensure minimum health on revival
				}

				await supabase
					.from("creatures")
					.update(updates)
					.eq("id", creature.id);
			}

			// Update local state
			setHabits(prev => prev.map(h =>
				h.id === habit.id
					? {
						...h,
						last_completed: now,
						current_streak: newStreak,
						longest_streak: newLongestStreak,
						total_completions: newTotalCompletions
					}
					: h
			));

			// Enhanced completion message with food reward info
			const revivalMessage = creature?.is_dead ? "\n🌟 Your pet has been revived!" : "";
			
			Alert.alert(
				"🎉 Habit Completed!",
				`${habit.name} - Day ${newStreak} streak!\n🍎 +${foodReward} food for your pet!${revivalMessage}`
			);

		} catch (err) {
			console.error("Error completing habit:", err);
			Alert.alert("Error", "Failed to complete habit");
		}
	};

	const deleteHabit = async (habitId: string) => {
		Alert.alert(
			"Delete Habit",
			"Are you sure you want to delete this habit?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await supabase
								.from("habits")
								.delete()
								.eq("id", habitId);

							setHabits(prev => prev.filter(h => h.id !== habitId));
						} catch (err) {
							console.error("Error deleting habit:", err);
							Alert.alert("Error", "Failed to delete habit");
						}
					}
				}
			]
		);
	};

	const isCompletedToday = (habit: Habit) => {
		if (!habit.last_completed) return false;
		const today = new Date().toDateString();
		const lastCompleted = new Date(habit.last_completed).toDateString();
		return lastCompleted === today;
	};

	// Streak emoji helper is now imported from constants

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4">
				<H1 className="text-center mb-6">📋 My Habits</H1>

				{/* Add Habit Section */}
				{showAddForm ? (
					<View className="bg-card p-4 rounded-lg mb-6 border border-border">
						<H2 className="mb-4">Add New Habit</H2>
						<TextInput
							className="border border-gray-300 rounded-lg p-3 mb-4 bg-white"
							placeholder="Enter habit name (e.g., 'Drink 8 glasses of water')"
							value={newHabitName}
							onChangeText={setNewHabitName}
							autoFocus
						/>
						<View className="flex-row space-x-2">
							<Button onPress={addHabit} className="flex-1">
								<Text>Add Habit</Text>
							</Button>
							<Button 
								onPress={() => {
									setShowAddForm(false);
									setNewHabitName("");
								}} 
								variant="outline"
								className="flex-1"
							>
								<Text>Cancel</Text>
							</Button>
						</View>
					</View>
				) : (
					<Button onPress={() => setShowAddForm(true)} className="mb-6">
						<Text>+ Add New Habit</Text>
					</Button>
				)}

				{/* Habits List */}
				{habits.length === 0 ? (
					<View className="bg-card p-6 rounded-lg items-center">
						<Text className="text-4xl mb-2">📋</Text>
						<H2 className="text-center mb-2">No habits yet</H2>
						<Muted className="text-center">Add your first habit to start building healthy routines!</Muted>
					</View>
				) : (
					<View className="space-y-4">
						{habits.map((habit) => (
							<View key={habit.id} className="bg-card p-4 rounded-lg border border-border">
								<View className="flex-row justify-between items-start mb-3">
									<View className="flex-1 mr-3">
										<Text className="text-lg font-medium">{habit.name}</Text>
										<View className="flex-row items-center mt-1">
											<Text className="text-sm mr-2">{getStreakEmoji(habit.current_streak)}</Text>
											<Text className="text-sm text-gray-600">
												{habit.current_streak} day streak
											</Text>
										</View>
									</View>
									<TouchableOpacity 
										onPress={() => deleteHabit(habit.id)}
										className="p-2"
									>
										<Text className="text-red-500">🗑️</Text>
									</TouchableOpacity>
								</View>

								{isCompletedToday(habit) ? (
									<View className="bg-green-50 p-3 rounded-lg border border-green-200">
										<View className="flex-row items-center justify-center">
											<Text className="text-green-600 font-medium">✅ Completed today!</Text>
										</View>
									</View>
								) : (
									<Button onPress={() => completeHabit(habit)}>
										<Text>✓ Mark as Done</Text>
									</Button>
								)}
							</View>
						))}
					</View>
				)}

				{/* Tips */}
				{habits.length > 0 && (
					<View className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
						<Text className="text-blue-800 font-medium mb-2">💡 Tips</Text>
						<Muted className="text-blue-700">
							• Complete habits daily to build streaks{"\n"}
							• Longer streaks give bigger pet bonuses{"\n"}
							• Start small and be consistent{"\n"}
							• Your pet gets happier when you complete habits!
						</Muted>
					</View>
				)}
			</View>
		</ScrollView>
	);
} 