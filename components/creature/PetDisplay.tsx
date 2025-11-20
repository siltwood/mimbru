import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { SpritePet, createAnimation } from '@/components/sprite-pet';

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

interface PetDisplayProps {
	creature: Creature;
	animationState: 'idle' | 'walking_up' | 'walking_down' | 'walking_left' | 'walking_right' | 'happy' | 'sad' | 'eating' | 'sleeping' | 'dead';
	onPetPress: () => void;
	floatingText: string | null;
}

export function PetDisplay({ creature, animationState, onPetPress, floatingText }: PetDisplayProps) {
	return (
		<TouchableOpacity
			onPress={onPetPress}
			className="items-center mb-6 relative border-4 border-black rounded-lg bg-green-50"
			style={{ height: 350, margin: 16 }}
			activeOpacity={0.7}
			disabled={creature.is_dead}
		>
			<SpritePet
				animationState={animationState}
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
			{creature.poop_count > 0 && (
				<View className="absolute bottom-4 right-4 flex-row flex-wrap" style={{ maxWidth: 100 }}>
					{Array.from({ length: Math.min(creature.poop_count, 5) }).map((_, i) => (
						<Text key={i} className="text-2xl mr-1 mb-1">💩</Text>
					))}
					{creature.poop_count > 5 && (
						<Text className="text-sm text-red-600 font-bold">+{creature.poop_count - 5} more!</Text>
					)}
				</View>
			)}

			{/* Passed Out Pet Message */}
			{creature.is_dead && (
				<View className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 px-3 py-2 rounded-lg border-2 border-red-300">
					<Text className="text-sm font-bold text-red-800 text-center">😵 Passed Out!</Text>
					<Text className="text-xs text-red-700 text-center">Feed to revive or complete habits</Text>
				</View>
			)}

			{/* Floating Animation Text */}
			{floatingText && (
				<View className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-300 animate-bounce">
					<Text className="text-lg font-bold text-pink-800 text-center">{floatingText}</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}
