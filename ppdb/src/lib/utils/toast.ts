import { toast as sonnerToast } from 'svelte-sonner';
import { TOAST_DURATION } from '$lib/constants/admin';

/**
 * Toast notification utilities
 * Wrapper around svelte-sonner with consistent configuration
 */

export const toast = {
	/**
	 * Show a success toast notification
	 */
	success: (message: string, description?: string) => {
		return sonnerToast.success(message, {
			description,
			duration: TOAST_DURATION
		});
	},

	/**
	 * Show an error toast notification
	 */
	error: (message: string, description?: string) => {
		return sonnerToast.error(message, {
			description,
			duration: TOAST_DURATION
		});
	},

	/**
	 * Show an info toast notification
	 */
	info: (message: string, description?: string) => {
		return sonnerToast.info(message, {
			description,
			duration: TOAST_DURATION
		});
	},

	/**
	 * Show a warning toast notification
	 */
	warning: (message: string, description?: string) => {
		return sonnerToast.warning(message, {
			description,
			duration: TOAST_DURATION
		});
	},

	/**
	 * Show a loading toast notification
	 * Returns a toast ID that can be used to update or dismiss the toast
	 */
	loading: (message: string, description?: string) => {
		return sonnerToast.loading(message, {
			description
		});
	},

	/**
	 * Dismiss a specific toast by ID
	 */
	dismiss: (toastId?: string | number) => {
		return sonnerToast.dismiss(toastId);
	},

	/**
	 * Show a promise toast that automatically updates based on promise state
	 */
	promise: <T>(
		promise: Promise<T>,
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: Error) => string);
		}
	) => {
		return sonnerToast.promise(promise, messages);
	}
};

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'An unexpected error occurred';
}
