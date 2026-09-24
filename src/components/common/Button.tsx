import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer';

  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'h-11 px-5 text-sm rounded-xl gap-2 min-h-[44px]',
    lg: 'h-12 sm:h-13 px-6 text-base rounded-xl gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow active:bg-primary-800 border border-primary-700/80',
    secondary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:bg-emerald-800 border border-emerald-700/80',
    outline:
      'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs hover:border-slate-300 active:bg-slate-100',
    subtle:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 active:bg-slate-300 border border-transparent',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:bg-rose-800 border border-rose-700',
    emergency:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg animate-pulse-subtle font-bold border border-rose-700',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
