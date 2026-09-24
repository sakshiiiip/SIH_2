import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MapPin, ChevronDown, Sparkles } from 'lucide-react';

interface LocationBadgeProps {
  onClick?: () => void;
  className?: string;
  variant?: 'pill' | 'compact' | 'card';
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  onClick,
  className = '',
  variant = 'pill',
}) => {
  const { t } = useTranslation();
  const { currentAddress, isLoadingAddress, isDetectingGPS } = useGeolocation();

  const localityText =
    currentAddress.locality || currentAddress.city || 'Baner, Pune';
  const sublocalityText = currentAddress.sublocality || currentAddress.displayName;

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 text-xs font-bold text-[#292824] hover:text-[#6E8B67] transition-colors cursor-pointer group ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#6E8B67] group-hover:scale-110 transition-transform" />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">
          {isDetectingGPS ? t('location.detecting', { defaultValue: 'Detecting...' }) : localityText}
        </span>
        <ChevronDown className="w-3 h-3 text-[#77736B]" />
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        onClick={onClick}
        className={`p-3 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E6ECE4] border border-[#CFDDD0] flex items-center justify-center text-[#445D3E]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#77736B] block">
              {t('location.serviceDeliveryLocation', { defaultValue: 'Service Delivery Location' })}
            </span>
            <strong className="text-xs text-[#292824] font-bold block truncate max-w-[200px] sm:max-w-xs">
              {isLoadingAddress ? t('location.updatingAddress', { defaultValue: 'Updating address...' }) : currentAddress.formattedAddress}
            </strong>
          </div>
        </div>
        <span className="text-xs font-bold text-[#6E8B67] hover:underline shrink-0">
          {t('common.change', { defaultValue: 'Change' })}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer group ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-[#E6ECE4] flex items-center justify-center text-[#445D3E] group-hover:bg-[#6E8B67] group-hover:text-white transition-colors">
        <MapPin className="w-3.5 h-3.5" />
      </div>
      <div className="text-left">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#77736B] block leading-tight">
          {t('location.deliveringTo', { defaultValue: 'Delivering to' })}
        </span>
        <div className="flex items-center gap-1 text-xs font-extrabold text-[#292824] leading-tight">
          <span className="truncate max-w-[110px] sm:max-w-[160px]">
            {isDetectingGPS ? t('location.detectingGPS', { defaultValue: 'Detecting GPS...' }) : localityText}
          </span>
          <ChevronDown className="w-3 h-3 text-[#77736B] group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
};
