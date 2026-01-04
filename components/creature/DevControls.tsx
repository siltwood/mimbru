import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Creature } from '@/lib/types/creature';
import { shouldShowDevControls } from '@/config/dev-config';

type StatKey = 'health' | 'happiness' | 'cleanliness' | 'hunger';

interface StatControlProps {
	label: string;
	emoji: string;
	stat: StatKey;
	value: number;
	onAdjust: (stat: StatKey, delta: number) => void;
}

function StatControl({ label, emoji, stat, value, onAdjust }: StatControlProps) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-sm font-medium text-purple-700 w-20">{emoji} {label}</Text>
			<View className="flex-row space-x-2">
				<Button onPress={() => onAdjust(stat, -20)} variant="outline" className="px-3 py-1 border-red-300">
					<Text className="text-red-600 text-xs">-20</Text>
				</Button>
				<Button onPress={() => onAdjust(stat, -10)} variant="outline" className="px-3 py-1 border-red-300">
					<Text className="text-red-600 text-xs">-10</Text>
				</Button>
				<Text className="text-sm font-bold text-purple-800 w-10 text-center">{value}</Text>
				<Button onPress={() => onAdjust(stat, 10)} variant="outline" className="px-3 py-1 border-green-300">
					<Text className="text-green-600 text-xs">+10</Text>
				</Button>
				<Button onPress={() => onAdjust(stat, 20)} variant="outline" className="px-3 py-1 border-green-300">
					<Text className="text-green-600 text-xs">+20</Text>
				</Button>
			</View>
		</View>
	);
}

interface DevControlsProps {
	creature: Creature;
	onForcePoop: () => void;
	onForceFaint: () => void;
	onAdjustStat: (stat: StatKey, delta: number) => void;
	onAdjustFood: (delta: number) => void;
	onResetStats: () => void;
}

export function DevControls({
	creature,
	onForcePoop,
	onForceFaint,
	onAdjustStat,
	onAdjustFood,
	onResetStats,
}: DevControlsProps) {
	if (!shouldShowDevControls()) return null;

	return (
		<View className="bg-purple-50 p-4 rounded-lg mt-6 border-2 border-purple-200">
			<Text className="text-center text-purple-800 font-bold mb-3">
				🧪 DEV TESTING CONTROLS
			</Text>

			{/* Quick Test Actions */}
			<View className="flex-row space-x-2 mb-4">
				<Button onPress={onForcePoop} variant="outline" className="flex-1 border-yellow-400">
					<Text className="text-yellow-600">💩 Force Poop</Text>
				</Button>
				<Button onPress={onForceFaint} variant="outline" className="flex-1 border-red-400">
					<Text className="text-red-600">😵 Force Faint</Text>
				</Button>
			</View>

			{/* Stat Adjustments */}
			<View className="space-y-3">
				<StatControl label="Health" emoji="❤️" stat="health" value={creature.health} onAdjust={onAdjustStat} />
				<StatControl label="Happy" emoji="😊" stat="happiness" value={creature.happiness} onAdjust={onAdjustStat} />
				<StatControl label="Clean" emoji="🧼" stat="cleanliness" value={creature.cleanliness} onAdjust={onAdjustStat} />
				<StatControl label="Hunger" emoji="🍎" stat="hunger" value={creature.hunger} onAdjust={onAdjustStat} />
			</View>

			{/* Food Controls */}
			<View className="flex-row items-center justify-between mt-3">
				<Text className="text-sm font-medium text-purple-700 w-20">🍎 Food</Text>
				<View className="flex-row space-x-2">
					<Button onPress={() => onAdjustFood(-1)} variant="outline" className="px-3 py-1 border-red-300">
						<Text className="text-red-600 text-xs">-1</Text>
					</Button>
					<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.food_count}</Text>
					<Button onPress={() => onAdjustFood(1)} variant="outline" className="px-3 py-1 border-green-300">
						<Text className="text-green-600 text-xs">+1</Text>
					</Button>
					<Button onPress={() => onAdjustFood(5)} variant="outline" className="px-3 py-1 border-green-300">
						<Text className="text-green-600 text-xs">+5</Text>
					</Button>
				</View>
			</View>

			{/* Reset Button */}
			<Button onPress={onResetStats} variant="outline" className="mt-4 border-purple-400">
				<Text className="text-purple-600">✨ Reset All Stats to 100</Text>
			</Button>

			<Text className="text-center text-xs text-purple-600 mt-2">
				⚠️ These controls are for testing only
			</Text>
		</View>
	);
}
