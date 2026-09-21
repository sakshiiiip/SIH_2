import React from 'react';

export type BadgeVariant =
  | 'verified'
  | 'pending'
  | 'emergency'
  | 'coop'
  | 'neutral'
  | 'urgent'
  | 'completed'
  | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    verified: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]',
    pending: 'bg-[#FAEDE8] text-[#643222] border-[#F4DCD3]',
    urgent: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]',
    emergency: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7] font-semibold',
    coop: 'bg-[#EFEBF4] text-[#3D314C] border-[#DFD8E8] font-medium',
    neutral: 'bg-[#F3EEE4] text-[#524E47] border-[#E8E2D5]',
    completed: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]',
    danger: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7]',
  };

  const dotColors = {
    verified: 'bg-[#6E8B67]',
    pending: 'bg-[#B37055]',
    urgent: 'bg-[#B37055]',
    emergency: 'bg-[#B86B6B] animate-pulse',
    coop: 'bg-[#7A6A8E]',
    neutral: 'bg-[#9A958B]',
    completed: 'bg-[#6E8B67]',
    danger: 'bg-[#B86B6B]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center border font-medium tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
};
