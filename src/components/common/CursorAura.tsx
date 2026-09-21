import React from 'react';
import { use3LayerAuraEngine } from '../../hooks/useCursorReactive';

/**
 * CursorAura:
 * Multi-layer visionOS / Apple inspired atmospheric lighting system.
 * Layer 1 (Core): Small luminous center (0.16 smoothing)
 * Layer 2 (Atmospheric Glow): Medium halo (0.08 smoothing)
 * Layer 3 (Diffused Field): Large ambient wake field (0.038 smoothing)
 *
 * Runs 100% in requestAnimationFrame with zero React re-renders.
 * Automatically adapts color to hover context (Customer, Worker, Admin tiers, CTAs).
 * Fades to resting state when cursor is still.
 */
export const CursorAura: React.FC = () => {
  const { containerRef, coreRef, glowRef, diffuseRef } = use3LayerAuraEngine();

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-500 opacity-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* LAYER 3: DIFFUSED FIELD (Expansive, soft atmospheric wake) */}
      <div
        ref={diffuseRef}
        className="pointer-events-none absolute top-0 left-0 w-[580px] h-[580px] rounded-full will-change-transform"
        style={{
          filter: 'blur(65px)',
        }}
      />

      {/* LAYER 2: ATMOSPHERIC GLOW (Medium halo with slight inertia) */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 w-[280px] h-[280px] rounded-full will-change-transform"
        style={{
          filter: 'blur(35px)',
        }}
      />

      {/* LAYER 1: CORE (Soft luminous center following cursor promptly) */}
      <div
        ref={coreRef}
        className="pointer-events-none absolute top-0 left-0 w-[90px] h-[90px] rounded-full will-change-transform"
        style={{
          filter: 'blur(14px)',
        }}
      />
    </div>
  );
};
