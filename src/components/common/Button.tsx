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
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E8B67] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer';

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'h-11 px-4.5 text-sm rounded-xl gap-2 min-h-[44px]',
    lg: 'h-12 sm:h-13 px-6 text-base rounded-2xl gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[#6E8B67] hover:bg-[#5D7A56] text-white shadow-sm hover:shadow active:bg-[#4E6748] border border-[#587352]',
    secondary:
      'bg-[#292824] hover:bg-[#383530] text-[#FAF7F2] shadow-sm active:bg-[#1B1A17] border border-[#292824]',
    outline:
      'border border-[#E8E2D5] bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#292824] shadow-subtle hover:border-[#D8CFBE] active:bg-[#EBE4D6]',
    subtle:
      'bg-[#F3EEE4] hover:bg-[#EBE4D6] text-[#292824] active:bg-[#E0D7C5] border border-transparent',
    ghost:
      'bg-transparent hover:bg-[#F3EEE4]/70 text-[#524E47] hover:text-[#292824] border border-transparent',
    danger:
      'bg-[#B86B6B] hover:bg-[#9B4E4E] text-white shadow-sm active:bg-[#853C3C] border border-[#9B4E4E]',
    emergency:
      'bg-[#B86B6B] hover:bg-[#9B4E4E] text-white shadow-md hover:shadow-lg animate-pulse-subtle font-semibold border border-[#9B4E4E]',
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
