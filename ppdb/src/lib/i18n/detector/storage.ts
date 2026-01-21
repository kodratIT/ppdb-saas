import { browser } from '$app/environment';
import type { Locale } from '../config';

const STORAGE_KEY = 'ppdb_locale';

export function getStoredLanguage(): Locale | null {
    if (!browser) return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored as Locale | null;
}

export function setStoredLanguage(lang: Locale): void {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, lang);
    // Also set cookie for SSR
    document.cookie = `locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}
