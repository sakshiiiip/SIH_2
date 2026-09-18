import React from 'react';
import { useCardMotion } from '../../hooks/useCursorReactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'subtle';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const {
    cardRef,
    glowRef,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
  } = useCardMotion({ maxTilt: 1.5, perspective: 1200 });

  const variantStyles = {
    default: 'bg-[#FCF9F3] border border-[#E8E2D5] shadow-subtle',
    elevated: 'bg-[#FCF9F3] border border-[#E0D9CB] shadow-card',
    outline: 'bg-transparent border border-[#E8E2D5]',
    subtle: 'bg-[#F3EEE4] border border-[#E8E2D5]/70',
  };

  const interactiveStyles = interactive
    ? 'hover:border-[#D8CFBE] shadow-subtle hover:shadow-card active:scale-[0.99] cursor-pointer will-change-transform'
    : '';

  if (interactive) {
    return (
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        style={{
          transition: 'border-color 180ms ease, box-shadow 220ms ease',
        }}
        {...props}
      >
        {/* Subtle internal radial light for interactive card */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            background:
              'radial-gradient(280px circle at var(--glow-x, 100px) var(--glow-y, 80px), rgba(168, 185, 163, 0.12), transparent 70%)',
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
