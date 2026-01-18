/**
 * Fetch utilities with retry logic and exponential backoff
 */

/**
 * Delay helper for exponential backoff
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry logic and exponential backoff
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	maxRetries = 3
): Promise<Response> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const response = await fetch(url, options);
			
			// If successful, return immediately
			if (response.ok) {
				return response;
			}
			
			// If server error (5xx) and not last attempt, retry
			if (response.status >= 500 && attempt < maxRetries - 1) {
				const backoffMs = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
				console.warn(`Request failed with ${response.status}, retrying in ${backoffMs}ms...`);
				await delay(backoffMs);
				continue;
			}
			
			// If client error (4xx) or last attempt, throw
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		} catch (error) {
			// If network error and not last attempt, retry
			if (attempt < maxRetries - 1) {
				const backoffMs = 1000 * Math.pow(2, attempt);
				console.warn(`Network error, retrying in ${backoffMs}ms...`, error);
				await delay(backoffMs);
				continue;
			}
			
			// Last attempt failed, throw error
			throw error;
		}
	}
	
	throw new Error('Max retries exceeded');
}

/**
 * Fetch JSON with retry logic
 */
export async function fetchJsonWithRetry<T>(
	url: string,
	options: RequestInit = {},
	maxRetries = 3
): Promise<T> {
	const response = await fetchWithRetry(url, options, maxRetries);
	return response.json();
}
