 import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',

    resources: {
      en: {
        translation: {
          'language.switchLang': 'Change Language',
          'auth.welcome': 'Welcome to Cooperative',
          'auth.chooseRoleSubtitle': 'How would you like to continue?',
          'roleSelection.title': 'Services & Operations',
          'roleSelection.subtitle':
            'Choose your operational role to access your dedicated workspace.',
          'nav.notifications': 'Notifications',
          'nav.resetDemo': 'Reset Demo Data',
          'nav.humanSupport': 'Direct Human Support',
        },
      },
hi: {
        translation: {
          'language.switchLang': 'भाषा बदलें',
          'auth.welcome': 'सहकारी मंच में आपका स्वागत है',
          'auth.chooseRoleSubtitle': 'आप कैसे आगे बढ़ना चाहते हैं?',
          'roleSelection.title': 'सेवाएँ और संचालन',
          'roleSelection.subtitle':
            'अपने कार्यक्षेत्र तक पहुँचने के लिए अपनी भूमिका चुनें।',
          'nav.notifications': 'सूचनाएँ',
          'nav.resetDemo': 'डेमो डेटा रीसेट करें',
          'nav.humanSupport': 'प्रत्यक्ष मानव सहायता',
        },
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
