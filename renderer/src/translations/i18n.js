import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import the translation files
import { Ar } from './ar';
import { En } from './en';
import { Hi } from './hi';
import { Ru } from './ru';
import { Fa } from './fa';
import { Fr } from './fr';
import { Ne } from './ne';
import { Es } from './es';
import { Id } from './id';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: En,
      },
      hi: {
        translation: Hi,
      },
      ru: {
        translation: Ru,
      },
      fa: {
        translation: Fa,
      },
      fr: {
        translation: Fr,
      },
      ne: {
        translation: Ne,
      },
      ar: {
        translation: Ar,
      },
      es: {
        translation: Es,
      },
      id: {
        translation: Id,
      },
    },
});

// i18n.changeLanguage('en');
export default i18n;
