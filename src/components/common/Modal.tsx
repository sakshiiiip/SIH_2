import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#292824]/40 backdrop-blur-sm transition-opacity animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet / Dialog Surface */}
      <div
        className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} bg-[#FCF9F3] rounded-t-3xl sm:rounded-2xl shadow-float border border-[#E8E2D5] max-h-[92dvh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#D8D3C8] rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-6 py-4.5 border-b border-[#E8E2D5] flex items-center justify-between shrink-0">
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-[#292824] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#77736B] mt-0.5">{subtitle}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F3EEE4] hover:bg-[#EBE4D6] text-[#77736B] hover:text-[#292824] flex items-center justify-center transition-colors -mr-2 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
