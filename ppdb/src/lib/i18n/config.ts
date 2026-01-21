export const defaultLocale = 'id';

export const locales = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
] as const;

export type Locale = (typeof locales)[number]['code'];
