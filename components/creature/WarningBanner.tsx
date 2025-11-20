import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface WarningBannerProps {
	warnings: string[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
	if (warnings.length === 0) return null;

	return (
		<View className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
			<Text className="text-red-800 font-bold text-center mb-1">⚠️ URGENT!</Text>
			{warnings.map((warning, index) => (
				<Text key={index} className="text-red-700 text-center text-sm">
					{warning}
				</Text>
			))}
		</View>
	);
}
