import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const buttonClass = (lang: 'en' | 'zh') =>
    `px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
      language === lang
        ? 'bg-red-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;

  return (
    <div className="flex space-x-2">
      <button onClick={() => setLanguage('en')} className={buttonClass('en')}>
        EN
      </button>
      <button onClick={() => setLanguage('zh')} className={buttonClass('zh')}>
        中
      </button>
    </div>
  );
};
