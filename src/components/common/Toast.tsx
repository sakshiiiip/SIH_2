import React from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCooperativeStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#6E8B67] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#B37055] shrink-0" />;
      case 'emergency':
        return <AlertOctagon className="w-5 h-5 text-[#B86B6B] shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[#537895] shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-[#CFDDD0] bg-[#FCF9F3]/95';
      case 'warning':
        return 'border-[#F4DCD3] bg-[#FCF9F3]/95';
      case 'emergency':
        return 'border-[#F4D7D7] bg-[#FCF9F3]/95';
      default:
        return 'border-[#E8E2D5] bg-[#FCF9F3]/95';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-card backdrop-blur-md transition-all duration-200 animate-slide-down ${getBorderColor()}`}
      role="alert"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-[#292824] leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-xs text-[#77736B] mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-[#9A958B] hover:text-[#292824] p-1 rounded-lg transition-colors -mr-1 -mt-1 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
