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
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
    elevated: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md',
    outline: 'bg-transparent border border-slate-200 dark:border-slate-700',
    subtle: 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60',
  };

  const interactiveStyles = interactive
    ? 'hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer will-change-transform'
    : '';

  if (interactive) {
    return (
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        style={{
          transition: 'border-color 180ms ease, box-shadow 220ms ease, transform 150ms ease',
        }}
        {...props}
      >
        {/* Subtle internal radial light for interactive card */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            background:
              'radial-gradient(280px circle at var(--glow-x, 100px) var(--glow-y, 80px), rgba(99, 102, 241, 0.08), transparent 70%)',
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
