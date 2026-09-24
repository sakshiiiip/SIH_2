import React from 'react';
import { LanguageToggle } from './LanguageToggle';

export const LanguageSelectionModal: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-full bg-white/95 border border-slate-200 shadow-md px-3 py-2">
        <span className="text-xs font-semibold text-slate-600">
          Language
        </span>

        <LanguageToggle variant="pill" />
      </div>
    </div>
  );
};
