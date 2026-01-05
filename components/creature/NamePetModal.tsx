import React, { useState } from 'react';
import { View, Modal, TextInput, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface NamePetModalProps {
	visible: boolean;
	onSubmit: (name: string) => void;
}

export function NamePetModal({ visible, onSubmit }: NamePetModalProps) {
	const [name, setName] = useState('');

	const handleSubmit = () => {
		const trimmed = name.trim();
		if (trimmed.length > 0) {
			onSubmit(trimmed);
			setName('');
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
		>
			<Pressable
				className="flex-1 bg-black/50 justify-center items-center p-6"
				onPress={() => {}} // Prevent dismiss on backdrop tap
			>
				<View className="bg-white rounded-2xl p-6 w-full max-w-sm">
					<Text className="text-2xl font-bold text-center mb-2">
						Welcome!
					</Text>
					<Text className="text-center text-gray-600 mb-6">
						What would you like to name your new pet?
					</Text>

					<TextInput
						className="border border-gray-300 rounded-lg p-4 text-lg mb-4"
						placeholder="Enter a name..."
						value={name}
						onChangeText={setName}
						maxLength={20}
						autoFocus
					/>

					<Button onPress={handleSubmit} disabled={name.trim().length === 0}>
						<Text>Let's Go!</Text>
					</Button>
				</View>
			</Pressable>
		</Modal>
	);
}
