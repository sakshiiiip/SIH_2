import React from 'react';

export interface SahaAILogoProps {
  /**
   * - 'full': The complete official logo + 2-line tagline unit ("Skill Se Pehchaan.\nKaam Se Udaan.")
   * - 'navbar': The complete logo + tagline unit optimized for headers and navbars
   * - 'mark': Cropped mark without tagline (only for special compact badges if needed)
   * - 'icon': Worker silhouette emblem
   */
  variant?: 'full' | 'navbar' | 'mark' | 'icon';
  /**
   * Sizing presets
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  /**
   * Class name for the outer container
   */
  className?: string;
  /**
   * Class name for the image element
   */
  imgClassName?: string;
  /**
   * Priority loading
   */
  priority?: boolean;
}

export const SahaAILogo: React.FC<SahaAILogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  imgClassName = '',
  priority = true,
}) => {
  // By official branding requirement, the complete logo + tagline is one branding unit:
  // "Skill Se Pehchaan. / Kaam Se Udaan."
  let src = '/sahaai-logo-full.png';
  let heightClass = 'h-16 sm:h-20';

  switch (variant) {
    case 'navbar':
      src = '/sahaai-logo-full.png';
      heightClass = 'h-11 sm:h-12';
      break;
    case 'icon':
      src = '/sahaai-icon.png';
      heightClass = 'h-8 w-8';
      break;
    case 'mark':
      src = '/sahaai-logo.png';
      heightClass = 'h-8 sm:h-9';
      break;
    case 'full':
    default:
      src = '/sahaai-logo-full.png';
      heightClass = 'h-16 sm:h-20';
      break;
  }

  // Size overrides
  if (size === 'xs') heightClass = 'h-6 sm:h-7';
  else if (size === 'sm') heightClass = 'h-8 sm:h-9';
  else if (size === 'md') {
    if (variant === 'navbar') heightClass = 'h-11 sm:h-12';
    else heightClass = 'h-16 sm:h-18';
  } else if (size === 'lg') heightClass = 'h-20 sm:h-24';
  else if (size === 'xl') heightClass = 'h-24 sm:h-28';

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt="सहाAI — Skill Se Pehchaan. Kaam Se Udaan."
        className={`${heightClass} w-auto object-contain shrink-0 ${imgClassName}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};
