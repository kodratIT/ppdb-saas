import { browser } from '$app/environment';
import { defaultLocale, type Locale } from './config';
import { en } from './loaders/en';
import { id } from './loaders/id';
import { detectLanguage } from './detector';
import { setStoredLanguage } from './detector/storage';
import { interpolate } from './utils/interpolate';
import type { TranslationKey, TranslationSchema } from './types';

const translations: Record<Locale, TranslationSchema> = {
    en,
    id
};

class I18nStore {
    #language = $state<Locale>(defaultLocale);
    #translations = $derived(translations[this.#language]);

    constructor() {
        if (browser) {
            this.#language = detectLanguage();
        }
    }

    get language() {
        return this.#language;
    }

    setLanguage(lang: Locale) {
        this.#language = lang;
        setStoredLanguage(lang);

        // Update HTML lang attribute
        if (browser) {
            document.documentElement.lang = lang;
        }
    }

    t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = this.#translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k as keyof typeof value];
            } else {
                return key; // Fallback to key if not found
            }
        }

        if (typeof value === 'string') {
            return interpolate(value, params);
        }

        return key;
    };
}

export const i18n = new I18nStore();
export const t = i18n.t;
