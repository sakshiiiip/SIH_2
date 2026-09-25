import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'dark';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { i18n } = useTranslation();

  const isHindi = i18n.language?.startsWith('hi');

  const setLanguage = (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('coop_language', lang);
    } catch {
      // ignore in restricted environments
    }
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center rounded-xl p-0.5 border shadow-2xs text-xs select-none transition-all ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80 text-slate-200'
          : 'bg-[#F3EEE4]/90 border-[#E8E2D5] text-[#524E47]'
      } ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          !isHindi
            ? isDark
              ? 'bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-white/10'
              : 'bg-white text-emerald-800 shadow-xs ring-1 ring-black/5'
            : isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={!isHindi}
        title="Switch to English"
      >
        EN
      </button>

      <span className={`px-0.5 text-xs font-light select-none ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
        |
      </span>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-devanagari ${
          isHindi
            ? isDark
              ? 'bg-slate-900 text-emerald-400 shadow-xs ring-1 ring-white/10'
              : 'bg-white text-emerald-800 shadow-xs ring-1 ring-black/5'
            : isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={isHindi}
        title="हिंदी में बदलें"
      >
        हिंदी
      </button>
    </div>
  );
};
