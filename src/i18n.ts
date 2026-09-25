import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { hi } from './locales/hi';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],

    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'coop_language',
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
