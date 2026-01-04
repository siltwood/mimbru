/**
 * Development Configuration
 *
 * Toggle dev features here. All features auto-disable in production builds.
 */

// Auth bypass - skip login and use mock user
export const DEV_AUTH_BYPASS = false;
export const DEV_TEST_USER_ID = 'c2ff23dd-518c-4004-ba7b-617dace033ab';

// Show dev controls panel (stat adjustments, force poop, etc.)
export const DEV_SHOW_CONTROLS = true;

// Show movement test button
export const DEV_SHOW_MOVEMENT_TEST = true;

// Helper: only enable if __DEV__ AND config flag is true
export const shouldShowDevControls = () => __DEV__ && DEV_SHOW_CONTROLS;
export const shouldShowMovementTest = () => __DEV__ && DEV_SHOW_MOVEMENT_TEST;
export const shouldBypassAuth = () => __DEV__ && DEV_AUTH_BYPASS;
