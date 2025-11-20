import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface ActionButtonsProps {
	isDead: boolean;
	foodCount: number;
	poopCount: number;
	onFeed: () => void;
	onClean: () => void;
	onPet: () => void;
}

export function ActionButtons({
	isDead,
	foodCount,
	poopCount,
	onFeed,
	onClean,
	onPet,
}: ActionButtonsProps) {
	return (
		<View className="space-y-3">
			{/* Feed Button */}
			<Button
				onPress={onFeed}
				variant="default"
				className={isDead ? "border-green-500 bg-green-50" : ""}
				disabled={foodCount <= 0}
			>
				<Text className={isDead ? "text-green-700" : ""}>
					{isDead ? "🌟 Feed to Revive Pet" : "🍎 Feed Pet"}
					{foodCount > 0 ? ` (${foodCount} food)` : " (No food!)"}
				</Text>
			</Button>

			{/* Clean Button */}
			<Button
				onPress={onClean}
				variant={poopCount > 0 ? "default" : "outline"}
				className={poopCount > 0 ? "border-red-500" : ""}
				disabled={isDead}
			>
				<Text className={isDead ? "text-gray-400" : ""}>
					{isDead
						? "😵 Can't clean (Passed out)"
						: `🧼 Clean Pet ${poopCount > 0 ? `(${poopCount} 💩)` : ""}`}
				</Text>
			</Button>

			{/* Pet Button */}
			<Button
				onPress={onPet}
				variant="outline"
				disabled={isDead}
			>
				<Text className={isDead ? "text-gray-400" : ""}>
					{isDead ? "😵 Can't pet (Passed out)" : "😍 Pet Your Creature"}
				</Text>
			</Button>
		</View>
	);
}
