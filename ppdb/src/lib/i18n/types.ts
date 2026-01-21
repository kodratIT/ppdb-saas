import type { en } from './loaders/en';

export type TranslationSchema = typeof en;

type NestedKeys<T> = T extends object
    ? {
        [K in keyof T]: K extends string
        ? T[K] extends string
        ? K
        : `${K}.${NestedKeys<T[K]>}`
        : never;
    }[keyof T]
    : never;

export type TranslationKey = NestedKeys<TranslationSchema>;
