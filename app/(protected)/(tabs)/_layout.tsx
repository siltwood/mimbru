import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: true,
			}}
			initialRouteName="creature"
		>
			<Tabs.Screen
				name="creature" 
				options={{ 
					title: "🐾 Pet",
					tabBarLabel: "Pet"
				}} 
			/>
			<Tabs.Screen
				name="habits"
				options={{
					title: "Habits",
					tabBarIcon: ({ color }) => (
						<Text style={{ color, fontSize: 20 }}>📋</Text>
					),
				}}
			/>
		</Tabs>
	);
}
