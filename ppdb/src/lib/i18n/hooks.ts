import { i18n } from './index.svelte';

/**
 * Hook to access the i18n store.
 */
export function useI18n() {
    return i18n;
}

/**
 * Hook to access the translation function.
 */
export function useTranslations() {
    return i18n.t;
}
