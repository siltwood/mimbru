import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";
import { CreatureDegradation } from "@/lib/creature-degradation";
import { shouldBypassAuth, DEV_TEST_USER_ID } from "@/config/dev-config";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();

	const signUp = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (data.session) {
			setSession(data.session);
		} else if (data.user && !data.session) {
			// Email confirmation required
			throw new Error("Please check your email to confirm your account.");
		}
	};

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (data.session) {
			setSession(data.session);
		}
	};

	const signOut = async () => {
		// Stop creature degradation when signing out
		CreatureDegradation.getInstance().stopDegradation();
		
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Error signing out:", error);
			return;
		} else {
			console.log("User signed out");
		}
	};

	useEffect(() => {
		if (shouldBypassAuth()) {
			const mockSession = {
				user: {
					id: DEV_TEST_USER_ID,
					email: 'test@test.com',
					aud: 'authenticated',
					role: 'authenticated',
				},
				access_token: 'mock-access-token',
				refresh_token: 'mock-refresh-token',
			} as Session;
			setSession(mockSession);
			setInitialized(true);
			return;
		}

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		setInitialized(true);
	}, []);

	// Start/stop creature degradation based on session
	useEffect(() => {
		if (session?.user) {
			// Start creature degradation when user is logged in
			CreatureDegradation.getInstance().startDegradation(session.user.id);
		} else {
			// Stop creature degradation when user logs out
			CreatureDegradation.getInstance().stopDegradation();
		}
	}, [session]);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			if (session) {
				router.replace("/creature");
			} else {
				router.replace("/welcome");
			}
		}
		// eslint-disable-next-line
	}, [initialized, session]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
