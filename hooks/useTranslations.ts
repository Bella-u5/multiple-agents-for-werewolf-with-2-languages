import { translations } from '../translations';
import { Language } from '../contexts/LanguageContext';

export const useTranslations = (language: Language) => {
  return translations[language];
};
