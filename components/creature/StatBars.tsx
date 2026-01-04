import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface StatBarProps {
	label: string;
	emoji: string;
	value: number;
	barColor: string;
}

function StatBar({ label, emoji, value, barColor }: StatBarProps) {
	const getStatusColor = (val: number) => {
		if (val >= 70) return "text-green-500";
		if (val >= 40) return "text-yellow-500";
		return "text-red-500";
	};

	return (
		<View className="flex-row items-center">
			<Text className="text-sm w-20">{emoji} {label}</Text>
			<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
				<View
					className={`h-3 ${barColor} rounded-full`}
					style={{ width: `${value}%` }}
				/>
			</View>
			<Text className={`text-sm w-12 text-right ${getStatusColor(value)}`}>
				{value}%
			</Text>
		</View>
	);
}

interface StatBarsProps {
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
}

export function StatBars({ health, happiness, cleanliness, hunger }: StatBarsProps) {
	return (
		<View className="mb-4 space-y-2">
			<StatBar label="Health" emoji="❤️" value={health} barColor="bg-red-500" />
			<StatBar label="Happy" emoji="😊" value={happiness} barColor="bg-yellow-500" />
			<StatBar label="Clean" emoji="🧼" value={cleanliness} barColor="bg-blue-500" />
			<StatBar label="Hunger" emoji="🍎" value={hunger} barColor="bg-green-500" />
		</View>
	);
}
