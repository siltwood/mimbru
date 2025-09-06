import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, Dimensions, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SpritePet, createAnimation } from "@/components/sprite-pet";

const { width: screenWidth } = Dimensions.get('window');

type Creature = {
	id: string;
	user_id: string;
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
	level: number;
	name: string;
	is_dead: boolean;
	last_fed: string;
	last_cleaned: string;
	poop_count: number;
	current_animation: string;
	created_at: string;
	updated_at: string;
	last_poop_time: string | null;
	last_pet_time: string | null;
	last_health_decay: string | null;
	food_count: number;
};

export default function CreatureScreen() {
	const { session, signOut } = useAuth();
	const [creature, setCreature] = useState<Creature | null>(null);
	const [loading, setLoading] = useState(true);
	const [floatingText, setFloatingText] = useState<string | null>(null);

	// Show cute floating animation
	const showFloatingAnimation = (text: string) => {
		setFloatingText(text);
		setTimeout(() => setFloatingText(null), 2000);
	};

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

	const fetchOrCreateCreature = async () => {
		try {
			const { data, error } = await supabase
				.from("creatures")
				.select("*")
				.eq("user_id", session?.user.id)
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
		try {
			const now = new Date().toISOString();
			const { data, error } = await supabase
				.from("creatures")
				.insert([
					{
						user_id: session?.user.id,
						name: "Habito",
						health: 100,
						happiness: 100,
						cleanliness: 100,
						hunger: 100,
						level: 1,
						is_dead: false,
						current_animation: "idle",
						last_poop_time: now,
						last_pet_time: null,
						last_health_decay: now,
						food_count: 10
					}
				])
				.select()
				.single();

			if (error) {
				console.error("Error creating creature:", error);
				// If creation fails due to unique constraint (user already has a creature),
				// try to fetch the existing creature instead
				if (error.code === '23505') { // PostgreSQL unique violation error
					console.log("Creature already exists for user, fetching existing one...");
					await fetchOrCreateCreature();
				}
				// If user doesn't exist (orphaned session), sign out
				else if (error.code === '23503' && error.message.includes('user_id')) {
					console.log("User no longer exists, signing out...");
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

	// NEW: Check for automatic updates (poop generation, health decay)
	const checkForAutomaticUpdates = async () => {
		if (!creature || creature.is_dead) return;

		const now = new Date();
		const updates: any = {};
		let needsUpdate = false;

		// Check for daily poop generation
		const lastPoop = creature.last_poop_time ? new Date(creature.last_poop_time) : new Date(creature.created_at);
		const hoursSinceLastPoop = (now.getTime() - lastPoop.getTime()) / (1000 * 60 * 60);
		
		if (hoursSinceLastPoop >= 24) { // Poop once every 24 hours
			updates.poop_count = Math.min(5, creature.poop_count + 1); // Max 5 poops
			updates.last_poop_time = now.toISOString();
			updates.cleanliness = Math.max(0, creature.cleanliness - 15); // Dirty from pooping
			needsUpdate = true;
		}

		// Check for health decay (every 12 hours if no habits completed recently)
		const lastDecay = creature.last_health_decay ? new Date(creature.last_health_decay) : new Date(creature.created_at);
		const hoursSinceLastDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);
		
		if (hoursSinceLastDecay >= 12) { // Check every 12 hours
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
				let healthDecay = 20;
				let happinessDecay = 15;
				
				// Increased decay when surrounded by poop (5+)
				if (creature.poop_count >= 5) {
					healthDecay = 35; // Much faster health decay
					happinessDecay = 25; // Much faster happiness decay
				}
				
				updates.health = Math.max(0, creature.health - healthDecay);
				updates.happiness = Math.max(0, creature.happiness - happinessDecay);
				updates.last_health_decay = now.toISOString();
				needsUpdate = true;

				// Check if pet should faint from health loss
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

	const feedCreature = async () => {
		if (!creature) return;

		// Check if player has food
		if (creature.food_count <= 0) {
			Alert.alert("🍎 No Food!", "Complete habits to earn food for your pet!");
			return;
		}

		const newHunger = Math.min(100, creature.hunger + 20);
		const newHappiness = Math.min(100, creature.happiness + 10);
		let newHealth = creature.health;
		
		// If pet is dead, revive it with feeding
		let updates: any = {
			hunger: newHunger, 
			happiness: newHappiness,
			food_count: creature.food_count - 1, // Consume 1 food
			last_fed: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		if (creature.is_dead) {
			updates.health = 30; // Revive with 30 health
			updates.is_dead = false;
			updates.current_animation = "idle";
			newHealth = 30;
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
						user_id: session?.user.id,
						action_type: creature.is_dead ? "revival_feeding" : "feed",
						hunger_effect: 20,
						happiness_effect: 10,
						health_effect: creature.is_dead ? 30 : 0
					}
				]);

				if (creature.is_dead) {
					Alert.alert("🌟 Revived!", "Your pet has been revived with food! Take better care of it!");
					showFloatingAnimation("✨ REVIVED! ✨");
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
		if (!creature) return;

		const poopBonus = creature.poop_count > 0 ? 20 : 0; // Extra cleanliness for cleaning poop
		const newCleanliness = Math.min(100, creature.cleanliness + 30 + poopBonus);
		const newHappiness = Math.min(100, creature.happiness + 15 + (poopBonus / 2));

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
						user_id: session?.user.id,
						action_type: "clean",
						cleanliness_effect: 30 + poopBonus,
						happiness_effect: 15 + (poopBonus / 2)
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

	// NEW: Pet the creature for bonding
	const petCreature = async () => {
		if (!creature) return;

		const now = new Date();
		const lastPetTime = creature.last_pet_time ? new Date(creature.last_pet_time) : null;
		
		// Limit petting to once every hour to prevent spam
		if (lastPetTime) {
			const hoursSinceLastPet = (now.getTime() - lastPetTime.getTime()) / (1000 * 60 * 60);
			if (hoursSinceLastPet < 1) {
				Alert.alert("😴", "Your pet is tired from all the attention! Try again in a bit.");
				return;
			}
		}

		const newHappiness = Math.min(100, creature.happiness + 15);
		const newHealth = Math.min(100, creature.health + 5);

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
						user_id: session?.user.id,
						action_type: "pet",
						happiness_effect: 15,
						health_effect: 5
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



	// TESTING FUNCTIONS - For development and testing
	const forcePooping = async () => {
		if (!creature) return;
		
		const newPoopCount = Math.min(10, creature.poop_count + 1); // Allow more poop for testing
		const newCleanliness = Math.max(0, creature.cleanliness - 15);
		
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
				showFloatingAnimation("😵 Fainted!");
			}
		} catch (err) {
			console.error("Error forcing faint:", err);
		}
	};

	const adjustStat = async (stat: 'health' | 'happiness' | 'cleanliness' | 'hunger', delta: number) => {
		if (!creature) return;
		
		const newValue = Math.max(0, Math.min(100, creature[stat] + delta));
		const updates: any = { 
			[stat]: newValue,
			updated_at: new Date().toISOString()
		};
		
		// If health goes to 0, make pet faint
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

	const resetAllStats = async () => {
		if (!creature) return;
		
		try {
			const { error } = await supabase
				.from("creatures")
				.update({ 
					health: 100,
					happiness: 100,
					cleanliness: 100,
					hunger: 100,
					poop_count: 0,
					food_count: 10,
					is_dead: false,
					current_animation: "idle",
					updated_at: new Date().toISOString()
				})
				.eq("id", creature.id);

			if (!error) {
				setCreature({
					...creature,
					health: 100,
					happiness: 100,
					cleanliness: 100,
					hunger: 100,
					poop_count: 0,
					food_count: 10,
					is_dead: false,
					current_animation: "idle"
				});
				Alert.alert("✨", "All stats reset to 100! (Test mode)");
			}
		} catch (err) {
			console.error("Error resetting stats:", err);
		}
	};

	const getAnimationState = (creature: Creature) => {
		if (creature.is_dead) return 'dead';
		if (creature.health < 30 || creature.happiness < 30) return 'sad';
		if (creature.happiness > 80) return 'happy';
		if (creature.hunger < 20) return 'eating';
		// The SpritePet component will handle walking directions automatically
		return 'idle';
	};

	const getStatusColor = (value: number) => {
		if (value >= 70) return "text-green-500";
		if (value >= 40) return "text-yellow-500";
		return "text-red-500";
	};

	// NEW: Get urgency warnings
	const getUrgentWarnings = (creature: Creature) => {
		const warnings = [];
		if (creature.poop_count >= 5) warnings.push("☠️ TOXIC! Too much poop is killing your pet!");
		else if (creature.poop_count >= 3) warnings.push("💩 Your pet is surrounded by poop!");
		if (creature.health < 20) warnings.push("💀 Health critically low!");
		if (creature.happiness < 20) warnings.push("😢 Pet is very sad!");
		if (creature.cleanliness < 20) warnings.push("🤢 Pet is filthy!");
		if (creature.hunger < 20) warnings.push("🍎 Pet is starving!");
		return warnings;
	};

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text>Loading your pet...</Text>
			</View>
		);
	}

	if (!creature) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text>Error loading creature</Text>
				<Button onPress={createCreature}>
					<Text>Create New Pet</Text>
				</Button>
			</View>
		);
	}



	const urgentWarnings = getUrgentWarnings(creature);

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4">
				<H1 className="text-center mb-4">🐾 {creature?.name || "Your Pet"}</H1>
			
			{/* Urgent Warnings */}
			{urgentWarnings.length > 0 && (
				<View className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
					<Text className="text-red-800 font-bold text-center mb-1">⚠️ URGENT!</Text>
					{urgentWarnings.map((warning, index) => (
						<Text key={index} className="text-red-700 text-center text-sm">
							{warning}
						</Text>
					))}
				</View>
			)}
			
			{/* Pet Walking Area */}
			<TouchableOpacity 
				onPress={petCreature}
				className="items-center mb-6 relative border-4 border-black rounded-lg bg-green-50"
				style={{ height: 350, margin: 16 }}
				activeOpacity={0.7}
			>
				<SpritePet
					animationState={getAnimationState(creature)}
					animations={{
						// Walking animations with your uploaded sprites!
						walking_up: createAnimation([
							require('@/assets/sprites/pet/walking/up1.png'),
							require('@/assets/sprites/pet/walking/up2.png'),
							require('@/assets/sprites/pet/walking/up3.png'),
							require('@/assets/sprites/pet/walking/up4.png'),
							require('@/assets/sprites/pet/walking/up5.png'),
							require('@/assets/sprites/pet/walking/up6.png'),
							require('@/assets/sprites/pet/walking/up7.png'),
							require('@/assets/sprites/pet/walking/up8.png'),
							require('@/assets/sprites/pet/walking/up9.png'),
						], 12, true),
						walking_down: createAnimation([
							require('@/assets/sprites/pet/walking/down1.png'),
							require('@/assets/sprites/pet/walking/down2.png'),
							require('@/assets/sprites/pet/walking/down3.png'),
							require('@/assets/sprites/pet/walking/down4.png'),
							require('@/assets/sprites/pet/walking/down5.png'),
							require('@/assets/sprites/pet/walking/down6.png'),
							require('@/assets/sprites/pet/walking/down7.png'),
							require('@/assets/sprites/pet/walking/down8.png'),
							require('@/assets/sprites/pet/walking/down9.png'),
						], 12, true),
						walking_left: createAnimation([
							require('@/assets/sprites/pet/walking/left1.png'),
							require('@/assets/sprites/pet/walking/left2.png'),
							require('@/assets/sprites/pet/walking/left3.png'),
							require('@/assets/sprites/pet/walking/left4.png'),
							require('@/assets/sprites/pet/walking/left5.png'),
							require('@/assets/sprites/pet/walking/left6.png'),
							require('@/assets/sprites/pet/walking/left7.png'),
							require('@/assets/sprites/pet/walking/left8.png'),
							require('@/assets/sprites/pet/walking/left9.png'),
						], 12, true),
						walking_right: createAnimation([
							require('@/assets/sprites/pet/walking/right1.png'),
							require('@/assets/sprites/pet/walking/right2.png'),
							require('@/assets/sprites/pet/walking/right3.png'),
							require('@/assets/sprites/pet/walking/right4.png'),
							require('@/assets/sprites/pet/walking/right5.png'),
							require('@/assets/sprites/pet/walking/right6.png'),
							require('@/assets/sprites/pet/walking/right7.png'),
							require('@/assets/sprites/pet/walking/right8.png'),
							require('@/assets/sprites/pet/walking/right9.png'),
						], 12, true),
						// Fallback to colored squares for other states until we add more sprites
					}}
					scale={3}
					bounds={{
						x: 24, // Account for 4px border + padding
						y: 24,
						width: screenWidth - 80, // Account for borders (4px each side) + margins (16px each side) + padding
						height: 282, // Account for borders (4px each side) + padding
					}}
				/>
				
				{/* Poop Display */}
				{creature && creature.poop_count > 0 && (
					<View className="absolute bottom-4 right-4 flex-row flex-wrap" style={{ maxWidth: 100 }}>
						{Array.from({ length: Math.min(creature.poop_count, 5) }).map((_, i) => (
							<Text key={i} className="text-2xl mr-1 mb-1">💩</Text>
						))}
						{creature.poop_count > 5 && (
							<Text className="text-sm text-red-600 font-bold">+{creature.poop_count - 5} more!</Text>
						)}
					</View>
				)}

				{/* Dead Pet Message */}
				{creature && creature.is_dead && (
					<View className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 px-3 py-2 rounded-lg border-2 border-red-300">
						<Text className="text-sm font-bold text-red-800 text-center">💀 Passed Out!</Text>
						<Text className="text-xs text-red-700 text-center">Feed to revive or complete habits</Text>
					</View>
				)}

				{/* Floating Animation Text */}
				{floatingText && (
					<View className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-300 animate-bounce">
						<Text className="text-lg font-bold text-pink-800 text-center">{floatingText}</Text>
					</View>
				)}

				{/* Tap to Pet Hint */}
				{creature && !creature.is_dead && !floatingText && (
					<View className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded">
						<Text className="text-xs text-gray-600">👆 Tap to pet!</Text>
					</View>
				)}
			</TouchableOpacity>

			{/* Food Counter */}
			<View className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
				<Text className="text-center text-yellow-800 font-bold">
					🍎 Food: {creature.food_count}
				</Text>
				<Text className="text-center text-xs text-yellow-600 mt-1">
					Complete habits to earn more food!
				</Text>
			</View>

			{/* Compact Health Bars */}
			<View className="mb-4 space-y-2">
				<View className="flex-row items-center">
					<Text className="text-sm w-20">❤️ Health</Text>
					<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
						<View 
							className="h-3 bg-red-500 rounded-full" 
							style={{ width: `${creature.health}%` }}
						/>
					</View>
					<Text className={`text-sm w-12 text-right ${getStatusColor(creature.health)}`}>
						{creature.health}%
					</Text>
				</View>

				<View className="flex-row items-center">
					<Text className="text-sm w-20">😊 Happy</Text>
					<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
						<View 
							className="h-3 bg-yellow-500 rounded-full" 
							style={{ width: `${creature.happiness}%` }}
						/>
					</View>
					<Text className={`text-sm w-12 text-right ${getStatusColor(creature.happiness)}`}>
						{creature.happiness}%
					</Text>
				</View>

				<View className="flex-row items-center">
					<Text className="text-sm w-20">🧼 Clean</Text>
					<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
						<View 
							className="h-3 bg-blue-500 rounded-full" 
							style={{ width: `${creature.cleanliness}%` }}
						/>
					</View>
					<Text className={`text-sm w-12 text-right ${getStatusColor(creature.cleanliness)}`}>
						{creature.cleanliness}%
					</Text>
				</View>

				<View className="flex-row items-center">
					<Text className="text-sm w-20">🍎 Hunger</Text>
					<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
						<View 
							className="h-3 bg-green-500 rounded-full" 
							style={{ width: `${creature.hunger}%` }}
						/>
					</View>
					<Text className={`text-sm w-12 text-right ${getStatusColor(creature.hunger)}`}>
						{creature.hunger}%
					</Text>
				</View>
			</View>

			{/* Actions */}
			<View className="space-y-3">
				<Button 
					onPress={feedCreature} 
					variant="default"
					className={creature.is_dead ? "border-green-500 bg-green-50" : ""}
					disabled={creature.food_count <= 0}
				>
					<Text className={creature.is_dead ? "text-green-700" : ""}>
						{creature.is_dead ? "🌟 Feed to Revive Pet" : "🍎 Feed Pet"} 
						{creature.food_count > 0 ? ` (${creature.food_count} food)` : " (No food!)"}
					</Text>
				</Button>
				
				<Button 
					onPress={cleanCreature} 
					variant={creature.poop_count > 0 ? "default" : "outline"}
					className={creature.poop_count > 0 ? "border-red-500" : ""}
				>
					<Text>
						🧼 Clean Pet {creature.poop_count > 0 && `(${creature.poop_count} 💩)`}
					</Text>
				</Button>

				<Button onPress={petCreature} variant="outline">
					<Text>😍 Pet Your Creature</Text>
				</Button>
			</View>

			{/* TESTING CONTROLS - Development Only */}
			<View className="bg-purple-50 p-4 rounded-lg mt-6 border-2 border-purple-200">
				<Text className="text-center text-purple-800 font-bold mb-3">
					🧪 DEV TESTING CONTROLS
				</Text>
				
				{/* Quick Test Actions */}
				<View className="flex-row space-x-2 mb-4">
					<Button onPress={forcePooping} variant="outline" className="flex-1 border-yellow-400">
						<Text className="text-yellow-600">💩 Force Poop</Text>
					</Button>
					<Button onPress={forceFainting} variant="outline" className="flex-1 border-red-400">
						<Text className="text-red-600">😵 Force Faint</Text>
					</Button>
				</View>

				{/* Stat Adjustments */}
				<View className="space-y-3">
					{/* Health Controls */}
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-medium text-purple-700 w-20">❤️ Health</Text>
						<View className="flex-row space-x-2">
							<Button onPress={() => adjustStat('health', -20)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-20</Text>
							</Button>
							<Button onPress={() => adjustStat('health', -10)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-10</Text>
							</Button>
							<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.health}</Text>
							<Button onPress={() => adjustStat('health', 10)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+10</Text>
							</Button>
							<Button onPress={() => adjustStat('health', 20)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+20</Text>
							</Button>
						</View>
					</View>

					{/* Happiness Controls */}
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-medium text-purple-700 w-20">😊 Happy</Text>
						<View className="flex-row space-x-2">
							<Button onPress={() => adjustStat('happiness', -20)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-20</Text>
							</Button>
							<Button onPress={() => adjustStat('happiness', -10)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-10</Text>
							</Button>
							<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.happiness}</Text>
							<Button onPress={() => adjustStat('happiness', 10)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+10</Text>
							</Button>
							<Button onPress={() => adjustStat('happiness', 20)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+20</Text>
							</Button>
						</View>
					</View>

					{/* Cleanliness Controls */}
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-medium text-purple-700 w-20">🧼 Clean</Text>
						<View className="flex-row space-x-2">
							<Button onPress={() => adjustStat('cleanliness', -20)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-20</Text>
							</Button>
							<Button onPress={() => adjustStat('cleanliness', -10)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-10</Text>
							</Button>
							<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.cleanliness}</Text>
							<Button onPress={() => adjustStat('cleanliness', 10)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+10</Text>
							</Button>
							<Button onPress={() => adjustStat('cleanliness', 20)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+20</Text>
							</Button>
						</View>
					</View>

					{/* Hunger Controls */}
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-medium text-purple-700 w-20">🍎 Hunger</Text>
						<View className="flex-row space-x-2">
							<Button onPress={() => adjustStat('hunger', -20)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-20</Text>
							</Button>
							<Button onPress={() => adjustStat('hunger', -10)} variant="outline" className="px-3 py-1 border-red-300">
								<Text className="text-red-600 text-xs">-10</Text>
							</Button>
							<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.hunger}</Text>
							<Button onPress={() => adjustStat('hunger', 10)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+10</Text>
							</Button>
							<Button onPress={() => adjustStat('hunger', 20)} variant="outline" className="px-3 py-1 border-green-300">
								<Text className="text-green-600 text-xs">+20</Text>
							</Button>
						</View>
					</View>
				</View>

				{/* Food Controls */}
				<View className="flex-row items-center justify-between mt-3">
					<Text className="text-sm font-medium text-purple-700 w-20">🍎 Food</Text>
					<View className="flex-row space-x-2">
						<Button onPress={() => {
							if (creature.food_count > 0) {
								const newFoodCount = creature.food_count - 1;
								supabase.from("creatures").update({ food_count: newFoodCount }).eq("id", creature.id);
								setCreature({ ...creature, food_count: newFoodCount });
							}
						}} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-1</Text>
						</Button>
						<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.food_count}</Text>
						<Button onPress={() => {
							const newFoodCount = creature.food_count + 1;
							supabase.from("creatures").update({ food_count: newFoodCount }).eq("id", creature.id);
							setCreature({ ...creature, food_count: newFoodCount });
						}} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+1</Text>
						</Button>
						<Button onPress={() => {
							const newFoodCount = creature.food_count + 5;
							supabase.from("creatures").update({ food_count: newFoodCount }).eq("id", creature.id);
							setCreature({ ...creature, food_count: newFoodCount });
						}} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+5</Text>
						</Button>
					</View>
				</View>

				{/* Reset Button */}
				<Button onPress={resetAllStats} variant="outline" className="mt-4 border-purple-400">
					<Text className="text-purple-600">✨ Reset All Stats to 100</Text>
				</Button>

				<Text className="text-center text-xs text-purple-600 mt-2">
					⚠️ These controls are for testing only
				</Text>
			</View>

			{/* Stats Info */}
			<View className="bg-gray-50 p-3 rounded-lg mt-4">
				<Text className="text-center text-sm text-gray-600 mb-1">
					📊 Level {creature.level} • Created {new Date(creature.created_at).toLocaleDateString()}
				</Text>
				<Text className="text-center text-xs text-gray-500">
					💡 Complete habits daily to prevent health decay!
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