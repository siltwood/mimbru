import React, { useState, useEffect } from 'react';
import { View, Modal, TextInput, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface NamePetModalProps {
	visible: boolean;
	currentName?: string;
	isRename?: boolean;
	onSubmit: (name: string) => void;
	onCancel?: () => void;
}

export function NamePetModal({ visible, currentName, isRename, onSubmit, onCancel }: NamePetModalProps) {
	const [name, setName] = useState('');

	useEffect(() => {
		if (visible && currentName && isRename) {
			setName(currentName);
		} else if (visible && !isRename) {
			setName('');
		}
	}, [visible, currentName, isRename]);

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
				onPress={isRename ? onCancel : undefined}
			>
				<Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm">
					<Text className="text-2xl font-bold text-center mb-2">
						{isRename ? "Rename Pet" : "Welcome!"}
					</Text>
					<Text className="text-center text-gray-600 mb-6">
						{isRename
							? "Give your pet a new name"
							: "What would you like to name your new pet?"}
					</Text>

					<TextInput
						className="border border-gray-300 rounded-lg p-4 text-lg mb-4"
						placeholder="Enter a name..."
						value={name}
						onChangeText={setName}
						maxLength={20}
						autoFocus
					/>

					<View className={isRename ? "flex-row gap-3" : ""}>
						{isRename && (
							<Button
								variant="outline"
								onPress={onCancel}
								className="flex-1"
							>
								<Text>Cancel</Text>
							</Button>
						)}
						<Button
							onPress={handleSubmit}
							disabled={name.trim().length === 0}
							className={isRename ? "flex-1" : ""}
						>
							<Text>{isRename ? "Save" : "Let's Go!"}</Text>
						</Button>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
