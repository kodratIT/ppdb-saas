type CacheEntry<T> = {
	data: T;
	expiry: number;
};

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get data from cache by key
 */
export function getCached<T>(key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;

	if (Date.now() > entry.expiry) {
		cache.delete(key);
		return null;
	}

	return entry.data as T;
}

/**
 * Set data to cache with TTL
 */
export function setCached<T>(key: string, data: T, ttlSeconds: number = 300): void {
	const expiry = Date.now() + ttlSeconds * 1000;
	cache.set(key, { data, expiry });
}

/**
 * Clear cache by pattern or all
 */
export function clearCache(pattern?: string): void {
	if (!pattern) {
		cache.clear();
		return;
	}

	for (const key of cache.keys()) {
		if (key.startsWith(pattern)) {
			cache.delete(key);
		}
	}
}
