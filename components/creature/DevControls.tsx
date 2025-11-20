import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Creature = {
	id: string;
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
	food_count: number;
	[key: string]: any;
};

interface DevControlsProps {
	creature: Creature;
	onForcePoop: () => void;
	onForceFaint: () => void;
	onAdjustStat: (stat: 'health' | 'happiness' | 'cleanliness' | 'hunger', delta: number) => void;
	onAdjustFood: (delta: number) => void;
	onResetStats: () => void;
	onTestDirection?: (direction: 'up' | 'down' | 'left' | 'right' | 'idle') => void;
}

export function DevControls({
	creature,
	onForcePoop,
	onForceFaint,
	onAdjustStat,
	onAdjustFood,
	onResetStats,
	onTestDirection,
}: DevControlsProps) {
	if (!__DEV__) return null;

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
				{/* Health Controls */}
				<View className="flex-row items-center justify-between">
					<Text className="text-sm font-medium text-purple-700 w-20">❤️ Health</Text>
					<View className="flex-row space-x-2">
						<Button onPress={() => onAdjustStat('health', -20)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-20</Text>
						</Button>
						<Button onPress={() => onAdjustStat('health', -10)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-10</Text>
						</Button>
						<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.health}</Text>
						<Button onPress={() => onAdjustStat('health', 10)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+10</Text>
						</Button>
						<Button onPress={() => onAdjustStat('health', 20)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+20</Text>
						</Button>
					</View>
				</View>

				{/* Happiness Controls */}
				<View className="flex-row items-center justify-between">
					<Text className="text-sm font-medium text-purple-700 w-20">😊 Happy</Text>
					<View className="flex-row space-x-2">
						<Button onPress={() => onAdjustStat('happiness', -20)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-20</Text>
						</Button>
						<Button onPress={() => onAdjustStat('happiness', -10)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-10</Text>
						</Button>
						<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.happiness}</Text>
						<Button onPress={() => onAdjustStat('happiness', 10)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+10</Text>
						</Button>
						<Button onPress={() => onAdjustStat('happiness', 20)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+20</Text>
						</Button>
					</View>
				</View>

				{/* Cleanliness Controls */}
				<View className="flex-row items-center justify-between">
					<Text className="text-sm font-medium text-purple-700 w-20">🧼 Clean</Text>
					<View className="flex-row space-x-2">
						<Button onPress={() => onAdjustStat('cleanliness', -20)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-20</Text>
						</Button>
						<Button onPress={() => onAdjustStat('cleanliness', -10)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-10</Text>
						</Button>
						<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.cleanliness}</Text>
						<Button onPress={() => onAdjustStat('cleanliness', 10)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+10</Text>
						</Button>
						<Button onPress={() => onAdjustStat('cleanliness', 20)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+20</Text>
						</Button>
					</View>
				</View>

				{/* Hunger Controls */}
				<View className="flex-row items-center justify-between">
					<Text className="text-sm font-medium text-purple-700 w-20">🍎 Hunger</Text>
					<View className="flex-row space-x-2">
						<Button onPress={() => onAdjustStat('hunger', -20)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-20</Text>
						</Button>
						<Button onPress={() => onAdjustStat('hunger', -10)} variant="outline" className="px-3 py-1 border-red-300">
							<Text className="text-red-600 text-xs">-10</Text>
						</Button>
						<Text className="text-sm font-bold text-purple-800 w-10 text-center">{creature.hunger}</Text>
						<Button onPress={() => onAdjustStat('hunger', 10)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+10</Text>
						</Button>
						<Button onPress={() => onAdjustStat('hunger', 20)} variant="outline" className="px-3 py-1 border-green-300">
							<Text className="text-green-600 text-xs">+20</Text>
						</Button>
					</View>
				</View>
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

			{/* Movement Testing */}
			{onTestDirection && (
				<View className="mt-4 pt-4 border-t border-purple-300">
					<Text className="text-center text-sm font-bold text-purple-700 mb-2">
						🎮 Test Movement Directions
					</Text>
					<View className="space-y-2">
						{/* Up button */}
						<View className="flex-row justify-center">
							<Button onPress={() => onTestDirection('up')} variant="outline" className="px-6 py-2 border-blue-300">
								<Text className="text-blue-600">⬆️ Up</Text>
							</Button>
						</View>
						{/* Left, Idle, Right buttons */}
						<View className="flex-row justify-center space-x-2">
							<Button onPress={() => onTestDirection('left')} variant="outline" className="px-4 py-2 border-blue-300">
								<Text className="text-blue-600">⬅️ Left</Text>
							</Button>
							<Button onPress={() => onTestDirection('idle')} variant="outline" className="px-4 py-2 border-gray-300">
								<Text className="text-gray-600">⏹️ Stop</Text>
							</Button>
							<Button onPress={() => onTestDirection('right')} variant="outline" className="px-4 py-2 border-blue-300">
								<Text className="text-blue-600">➡️ Right</Text>
							</Button>
						</View>
						{/* Down button */}
						<View className="flex-row justify-center">
							<Button onPress={() => onTestDirection('down')} variant="outline" className="px-6 py-2 border-blue-300">
								<Text className="text-blue-600">⬇️ Down</Text>
							</Button>
						</View>
					</View>
				</View>
			)}

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
