export const isDevMode = process.env.NODE_ENV !== 'production';
export const endpoint = isDevMode ? 'http://localhost:8000' : '';

/** Site id from vepp, need for dev mode */
export const SITE_ID = 1;

export const languages = {
  en: 'English',
  ru: 'Русский',
};

export type languageTypes = keyof typeof languages;

export const defaultLang = Object.keys(languages)[0];
