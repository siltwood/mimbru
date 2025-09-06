import { useEffect } from "react";
import { router } from "expo-router";

export default function IndexRedirect() {
	useEffect(() => {
		// Redirect to creature screen since we removed the home screen
		router.replace("/creature");
	}, []);

	return null;
} 