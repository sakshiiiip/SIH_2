import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  variant?: 'pill';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'pill',
}) => {
  const { i18n } = useTranslation();

  const isHindi = i18n.language?.startsWith('hi');

  const toggleLanguage = () => {
    const nextLanguage = isHindi ? 'en' : 'hi';

    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('coop_language', nextLanguage);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={
        variant === 'pill'
          ? 'inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer'
          : 'inline-flex items-center gap-2'
      }
      aria-label="Change language"
    >
      <Globe className="w-4 h-4 text-emerald-600" />

      <span>
        {isHindi ? 'English' : 'हिन्दी'}
      </span>
    </button>
  );
};
