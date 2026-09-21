import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'blue' | 'orange' | 'purple' | 'neutral';
  className?: string;
}

const ACCENT_MAP = {
  green:   { border: 'border-[#CFDDD0]', bg: 'bg-[#EEF3EC]', label: 'text-[#364A32]', value: 'text-[#2A3927]', sub: 'text-[#527048]' },
  blue:    { border: 'border-[#B8CBDD]', bg: 'bg-[#E9EFF5]', label: 'text-[#2B4C68]', value: 'text-[#21385A]', sub: 'text-[#3D6280]' },
  orange:  { border: 'border-[#F4DCD3]', bg: 'bg-[#FAF0EB]', label: 'text-[#643222]', value: 'text-[#4E2415]', sub: 'text-[#80432E]' },
  purple:  { border: 'border-[#DFD8E8]', bg: 'bg-[#F4F1F8]', label: 'text-[#3D314C]', value: 'text-[#2D2239]', sub: 'text-[#5C4A74]' },
  neutral: { border: 'border-[#E8E2D5]', bg: 'bg-[#FCF9F3]', label: 'text-[#77736B]', value: 'text-[#292824]', sub: 'text-[#77736B]' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subLabel,
  icon,
  accent = 'neutral',
  className = '',
}) => {
  const colors = ACCENT_MAP[accent];
  return (
    <div className={`p-4 ${colors.bg} border ${colors.border} rounded-2xl shadow-card flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="shrink-0 opacity-80">{icon}</span>}
        <span className={`text-[11px] font-bold uppercase tracking-wider ${colors.label}`}>{label}</span>
      </div>
      <span className={`text-2xl font-bold font-mono mt-0.5 ${colors.value}`}>{value}</span>
      {subLabel && <span className={`text-[11px] font-medium ${colors.sub}`}>{subLabel}</span>}
    </div>
  );
};
