import { browser } from '$app/environment';
import { defaultLocale, locales, type Locale } from '../config';
import { getStoredLanguage } from './storage';

export function detectLanguage(): Locale {
    if (!browser) return defaultLocale;

    // 1. URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (isValidLocale(urlLang)) return urlLang as Locale;

    // 2. Cookie (handled by server usually, but we can check if needed or just skip to storage)
    // We already set cookie in storage.ts, so if it's there, likely it matches storage.

    // 3. LocalStorage
    const storedLang = getStoredLanguage();
    if (isValidLocale(storedLang)) return storedLang as Locale;

    // 4. Browser navigator
    const browserLang = navigator.language.split('-')[0];
    if (isValidLocale(browserLang)) return browserLang as Locale;

    // 5. Fallback
    return defaultLocale;
}

function isValidLocale(lang: string | null): boolean {
    if (!lang) return false;
    return locales.some((l) => l.code === lang);
}
