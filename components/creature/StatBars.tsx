import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface StatBarsProps {
	health: number;
	happiness: number;
	cleanliness: number;
	hunger: number;
}

export function StatBars({ health, happiness, cleanliness, hunger }: StatBarsProps) {
	const getStatusColor = (value: number) => {
		if (value >= 70) return "text-green-500";
		if (value >= 40) return "text-yellow-500";
		return "text-red-500";
	};

	return (
		<View className="mb-4 space-y-2">
			{/* Health Bar */}
			<View className="flex-row items-center">
				<Text className="text-sm w-20">❤️ Health</Text>
				<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
					<View
						className="h-3 bg-red-500 rounded-full"
						style={{ width: `${health}%` }}
					/>
				</View>
				<Text className={`text-sm w-12 text-right ${getStatusColor(health)}`}>
					{health}%
				</Text>
			</View>

			{/* Happiness Bar */}
			<View className="flex-row items-center">
				<Text className="text-sm w-20">😊 Happy</Text>
				<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
					<View
						className="h-3 bg-yellow-500 rounded-full"
						style={{ width: `${happiness}%` }}
					/>
				</View>
				<Text className={`text-sm w-12 text-right ${getStatusColor(happiness)}`}>
					{happiness}%
				</Text>
			</View>

			{/* Cleanliness Bar */}
			<View className="flex-row items-center">
				<Text className="text-sm w-20">🧼 Clean</Text>
				<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
					<View
						className="h-3 bg-blue-500 rounded-full"
						style={{ width: `${cleanliness}%` }}
					/>
				</View>
				<Text className={`text-sm w-12 text-right ${getStatusColor(cleanliness)}`}>
					{cleanliness}%
				</Text>
			</View>

			{/* Hunger Bar */}
			<View className="flex-row items-center">
				<Text className="text-sm w-20">🍎 Hunger</Text>
				<View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
					<View
						className="h-3 bg-green-500 rounded-full"
						style={{ width: `${hunger}%` }}
					/>
				</View>
				<Text className={`text-sm w-12 text-right ${getStatusColor(hunger)}`}>
					{hunger}%
				</Text>
			</View>
		</View>
	);
}
