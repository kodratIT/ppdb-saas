/**
 * Error message constants for user-friendly error handling
 */

export const ERROR_MESSAGES = {
	// Network errors
	NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
	TIMEOUT_ERROR: 'Request timed out. Please try again.',
	
	// Authentication errors
	UNAUTHORIZED: 'You do not have permission to perform this action.',
	UNAUTHENTICATED: 'Please sign in to continue.',
	SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
	
	// Validation errors
	VALIDATION_ERROR: 'Please check your input and try again.',
	MISSING_DATA: 'Required information is missing.',
	INVALID_FORMAT: 'The provided data format is invalid.',
	
	// Resource errors
	TENANT_NOT_FOUND: 'School not found. It may have been deleted.',
	USER_NOT_FOUND: 'User not found.',
	RESOURCE_NOT_FOUND: 'The requested resource was not found.',
	
	// Operation errors
	BULK_PARTIAL_FAILURE: 'Some operations failed. See details below.',
	EXPORT_FAILED: 'Failed to generate export file. Please try again.',
	UPDATE_FAILED: 'Failed to update. Please try again.',
	DELETE_FAILED: 'Failed to delete. Please try again.',
	
	// Database errors
	DATABASE_ERROR: 'A database error occurred. Please try again.',
	CONSTRAINT_VIOLATION: 'This operation violates data constraints.',
	
	// Generic errors
	UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
	SERVER_ERROR: 'A server error occurred. Please try again later.'
} as const;

/**
 * Error codes for programmatic error handling
 */
export const ERROR_CODES = {
	NETWORK_ERROR: 'NETWORK_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
	UNAUTHENTICATED: 'UNAUTHENTICATED',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	NOT_FOUND: 'NOT_FOUND',
	SERVER_ERROR: 'SERVER_ERROR',
	DATABASE_ERROR: 'DATABASE_ERROR'
} as const;

/**
 * Map error types to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		// Check for specific error patterns
		if (error.message.includes('fetch')) {
			return ERROR_MESSAGES.NETWORK_ERROR;
		}
		if (error.message.includes('timeout')) {
			return ERROR_MESSAGES.TIMEOUT_ERROR;
		}
		if (error.message.includes('unauthorized') || error.message.includes('permission')) {
			return ERROR_MESSAGES.UNAUTHORIZED;
		}
		if (error.message.includes('not found')) {
			return ERROR_MESSAGES.RESOURCE_NOT_FOUND;
		}
		
		// Return the error message if it's already user-friendly
		return error.message;
	}
	
	if (typeof error === 'string') {
		return error;
	}
	
	return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Create a structured error response
 */
export function createErrorResponse(
	message: string,
	code?: string,
	details?: Record<string, unknown>
) {
	return {
		success: false,
		error: {
			message,
			code: code || ERROR_CODES.SERVER_ERROR,
			details
		}
	};
}
