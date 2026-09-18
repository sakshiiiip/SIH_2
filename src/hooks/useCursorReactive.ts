import { useRef, useEffect, useCallback } from 'react';

/**
 * Checks if the current device has a fine pointer (mouse/trackpad) and does not prefer reduced motion.
 */
export function isInteractivePointer(): boolean {
  if (typeof window === 'undefined') return false;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return hasFinePointer && !prefersReducedMotion;
}

export type CursorContextType =
  | 'default'
  | 'customer'
  | 'worker'
  | 'society_manager'
  | 'federation_manager'
  | 'federation_admin'
  | 'button'
  | 'card'
  | 'hero';

export const ROLE_RGB_MAP: Record<string, [number, number, number]> = {
  default: [168, 185, 163], // Soft Sage
  customer: [168, 185, 163], // Soft Sage
  worker: [184, 203, 221], // Powder Blue
  society_manager: [233, 197, 181], // Soft Peach
  federation_manager: [201, 189, 216], // Dusty Lavender
  federation_admin: [201, 189, 216], // Dusty Lavender
  button: [168, 185, 163],
  card: [168, 185, 163],
  hero: [168, 185, 163],
};

/**
 * Global event dispatcher to smoothly set cursor context color / size / mode
 */
let globalTargetColor: [number, number, number] = [168, 185, 163];
let globalTargetScale = 1.0;
let globalTargetIntensity = 0.85;

export function setCursorContext(type: CursorContextType, customScale?: number, customIntensity?: number) {
  if (ROLE_RGB_MAP[type]) {
    globalTargetColor = ROLE_RGB_MAP[type];
  }
  if (type === 'button') {
    globalTargetScale = customScale || 0.85;
    globalTargetIntensity = customIntensity || 1.0;
  } else if (type === 'card') {
    globalTargetScale = customScale || 1.2;
    globalTargetIntensity = customIntensity || 0.9;
  } else if (type === 'hero') {
    globalTargetScale = customScale || 1.35;
    globalTargetIntensity = customIntensity || 0.75;
  } else {
    globalTargetScale = customScale || 1.0;
    globalTargetIntensity = customIntensity || 0.85;
  }
}

export function resetCursorContext() {
  globalTargetColor = [168, 185, 163];
  globalTargetScale = 1.0;
  globalTargetIntensity = 0.85;
}

/**
 * use3LayerAuraEngine:
 * Coordinates the 3 layered aura physics (Core, Atmospheric Glow, Diffused Field)
 * with independent smoothing, color lerping, velocity reaction, and settling.
 */
export function use3LayerAuraEngine() {
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const diffuseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: -1000, y: -1000 });
  const core = useRef({ x: -1000, y: -1000 });
  const glow = useRef({ x: -1000, y: -1000 });
  const diffuse = useRef({ x: -1000, y: -1000 });

  const currentColor = useRef<[number, number, number]>([13, 148, 136]);
  const currentScale = useRef(1.0);
  const currentIntensity = useRef(0.85);

  const lastMoveTime = useRef(Date.now());
  const velocity = useRef(0);
  const isVisible = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!isInteractivePointer()) return;

    let prevX = -1000;
    let prevY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      lastMoveTime.current = Date.now();

      if (prevX !== -1000) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        velocity.current = Math.min(1.5, Math.sqrt(dx * dx + dy * dy) / 35);
      }
      prevX = e.clientX;
      prevY = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        core.current = { x: e.clientX, y: e.clientY };
        glow.current = { x: e.clientX, y: e.clientY };
        diffuse.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) {
          containerRef.current.style.opacity = '1';
        }
      }
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isVisible.current = true;
      target.current = { x: e.clientX, y: e.clientY };
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateLoop = () => {
      if (isVisible.current) {
        const timeSinceMove = Date.now() - lastMoveTime.current;
        // Velocity decays smoothly
        velocity.current *= 0.92;

        // Stillness resting settling: when cursor stops for >300ms, gently relax opacity
        const stillnessFactor = timeSinceMove > 300 ? Math.max(0.40, 1 - (timeSinceMove - 300) / 1000) : 1;

        // Layer 1: Core (fast smoothing 0.16)
        core.current.x += (target.current.x - core.current.x) * 0.16;
        core.current.y += (target.current.y - core.current.y) * 0.16;

        // Layer 2: Atmospheric Glow (medium smoothing 0.08)
        glow.current.x += (target.current.x - glow.current.x) * 0.08;
        glow.current.y += (target.current.y - glow.current.y) * 0.08;

        // Layer 3: Diffused Field (soft slow smoothing 0.038)
        diffuse.current.x += (target.current.x - diffuse.current.x) * 0.038;
        diffuse.current.y += (target.current.y - diffuse.current.y) * 0.038;

        // Color interpolation
        const cLerp = 0.08;
        currentColor.current[0] += (globalTargetColor[0] - currentColor.current[0]) * cLerp;
        currentColor.current[1] += (globalTargetColor[1] - currentColor.current[1]) * cLerp;
        currentColor.current[2] += (globalTargetColor[2] - currentColor.current[2]) * cLerp;

        const r = Math.round(currentColor.current[0]);
        const g = Math.round(currentColor.current[1]);
        const b = Math.round(currentColor.current[2]);

        // Scale & Intensity interpolation
        currentScale.current += (globalTargetScale - currentScale.current) * 0.10;
        currentIntensity.current += (globalTargetIntensity - currentIntensity.current) * 0.10;

        const dynamicScale = currentScale.current * (1 + velocity.current * 0.06);
        const dynamicAlpha = currentIntensity.current * stillnessFactor;

        // Apply Layer 1: Core (mild & delicate)
        if (coreRef.current) {
          coreRef.current.style.transform = `translate3d(${(core.current.x - 45).toFixed(1)}px, ${(core.current.y - 45).toFixed(1)}px, 0) scale(${dynamicScale.toFixed(2)})`;
          coreRef.current.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, ${(0.06 * dynamicAlpha).toFixed(3)}) 0%, rgba(${r}, ${g}, ${b}, ${(0.018 * dynamicAlpha).toFixed(3)}) 50%, transparent 80%)`;
        }

        // Layer 2: Atmospheric Glow (soft medium halo)
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${(glow.current.x - 140).toFixed(1)}px, ${(glow.current.y - 140).toFixed(1)}px, 0) scale(${dynamicScale.toFixed(2)})`;
          glowRef.current.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, ${(0.035 * dynamicAlpha).toFixed(3)}) 0%, rgba(${r}, ${g}, ${b}, ${(0.008 * dynamicAlpha).toFixed(3)}) 60%, transparent 85%)`;
        }

        // Layer 3: Diffused Field (very soft subtle ambient field)
        if (diffuseRef.current) {
          diffuseRef.current.style.transform = `translate3d(${(diffuse.current.x - 290).toFixed(1)}px, ${(diffuse.current.y - 290).toFixed(1)}px, 0) scale(${dynamicScale.toFixed(2)})`;
          diffuseRef.current.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, ${(0.015 * dynamicAlpha).toFixed(3)}) 0%, rgba(${r}, ${g}, ${b}, ${(0.003 * dynamicAlpha).toFixed(3)}) 55%, transparent 80%)`;
        }
      }

      rafId.current = requestAnimationFrame(updateLoop);
    };

    rafId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { containerRef, coreRef, glowRef, diffuseRef };
}

/**
 * useCardMotion:
 * Refined 3-layer internal parallax, 3D micro-tilt, and light-source shadow.
 */
export function useCardMotion({
  maxTilt = 2.2,
  perspective = 1100,
  iconParallax = 4.5,
  textParallax = 1.2,
  cursorRole = 'default' as CursorContextType,
} = {}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const target = useRef({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, shadowX: 0, shadowY: 0 });
  const current = useRef({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, shadowX: 0, shadowY: 0 });
  const isHovered = useRef(false);
  const rafId = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!cardRef.current) return;

    const lerp = 0.13;
    current.current.rotateX += (target.current.rotateX - current.current.rotateX) * lerp;
    current.current.rotateY += (target.current.rotateY - current.current.rotateY) * lerp;
    current.current.shadowX += (target.current.shadowX - current.current.shadowX) * lerp;
    current.current.shadowY += (target.current.shadowY - current.current.shadowY) * lerp;

    // Apply 3D card tilt & dynamic shadow
    if (isHovered.current) {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${current.current.rotateX.toFixed(2)}deg) rotateY(${current.current.rotateY.toFixed(2)}deg) translateY(-5px)`;
      cardRef.current.style.boxShadow = `${(-current.current.shadowX * 1.6).toFixed(1)}px ${(12 + current.current.shadowY * 1.4).toFixed(1)}px 28px -4px rgba(75, 60, 40, 0.08), 0 2px 6px -1px rgba(75, 60, 40, 0.04)`;
    } else {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${current.current.rotateX.toFixed(2)}deg) rotateY(${current.current.rotateY.toFixed(2)}deg) translateY(0px)`;
      cardRef.current.style.boxShadow = '';
    }

    // Apply internal icon parallax (Layer 3)
    if (iconRef.current) {
      const iconX = (current.current.rotateY / maxTilt) * iconParallax;
      const iconY = (-current.current.rotateX / maxTilt) * iconParallax;
      iconRef.current.style.transform = isHovered.current
        ? `translate3d(${iconX.toFixed(1)}px, ${iconY.toFixed(1)}px, 0) scale(1.06)`
        : 'translate3d(0, 0, 0) scale(1)';
    }

    // Apply internal text parallax (Layer 2)
    if (textRef.current) {
      const textX = (current.current.rotateY / maxTilt) * textParallax;
      const textY = (-current.current.rotateX / maxTilt) * textParallax;
      textRef.current.style.transform = isHovered.current
        ? `translate3d(${textX.toFixed(1)}px, ${textY.toFixed(1)}px, 0)`
        : 'translate3d(0, 0, 0)';
    }

    const isMoving =
      Math.abs(target.current.rotateX - current.current.rotateX) > 0.01 ||
      Math.abs(target.current.rotateY - current.current.rotateY) > 0.01 ||
      isHovered.current;

    if (isMoving) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }
  }, [perspective, maxTilt, iconParallax, textParallax]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractivePointer() || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    target.current.rotateX = -normY * maxTilt;
    target.current.rotateY = normX * maxTilt;
    target.current.shadowX = normX * 6;
    target.current.shadowY = normY * 6;

    if (glowRef.current) {
      glowRef.current.style.setProperty('--glow-x', `${x.toFixed(1)}px`);
      glowRef.current.style.setProperty('--glow-y', `${y.toFixed(1)}px`);
    }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  const onPointerEnter = () => {
    if (!isInteractivePointer()) return;
    isHovered.current = true;
    setCursorContext(cursorRole, 1.22, 1.15);
    if (glowRef.current) {
      glowRef.current.style.opacity = '1';
    }
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  const onPointerLeave = () => {
    isHovered.current = false;
    resetCursorContext();
    target.current = { rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, shadowX: 0, shadowY: 0 };
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    cardRef,
    iconRef,
    textRef,
    glowRef,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
  };
}

/**
 * useMagneticButton:
 * Subconscious proximity detection + smooth magnetic pull (1-4px)
 */
export function useMagneticButton({
  maxDistance = 4,
  pullStrength = 0.18,
  cursorRole = 'button' as CursorContextType,
} = {}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!btnRef.current) return;
    const lerp = 0.16;
    current.current.x += (target.current.x - current.current.x) * lerp;
    current.current.y += (target.current.y - current.current.y) * lerp;

    btnRef.current.style.transform = `translate3d(${current.current.x.toFixed(1)}px, ${current.current.y.toFixed(1)}px, 0)`;

    const isMoving =
      Math.abs(target.current.x - current.current.x) > 0.05 ||
      Math.abs(target.current.y - current.current.y) > 0.05;

    if (isMoving) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isInteractivePointer() || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (e.clientX - centerX) * pullStrength;
    const dy = (e.clientY - centerY) * pullStrength;

    target.current.x = Math.max(-maxDistance, Math.min(maxDistance, dx));
    target.current.y = Math.max(-maxDistance, Math.min(maxDistance, dy));

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  const onPointerEnter = () => {
    if (!isInteractivePointer()) return;
    setCursorContext(cursorRole, 0.85, 1.3);
  };

  const onPointerLeave = () => {
    target.current = { x: 0, y: 0 };
    resetCursorContext();
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    btnRef,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
  };
}

/**
 * useBackgroundParallax:
 * Soft ambient drift for background mesh layers.
 */
export function useBackgroundParallax(driftFactor = 0.025) {
  const bgRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!isInteractivePointer()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      target.current.x = (e.clientX - centerX) * driftFactor;
      target.current.y = (e.clientY - centerY) * driftFactor;

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      if (!bgRef.current) return;
      const lerp = 0.045;
      current.current.x += (target.current.x - current.current.x) * lerp;
      current.current.y += (target.current.y - current.current.y) * lerp;

      bgRef.current.style.transform = `translate3d(${current.current.x.toFixed(1)}px, ${current.current.y.toFixed(1)}px, 0)`;

      const isMoving =
        Math.abs(target.current.x - current.current.x) > 0.05 ||
        Math.abs(target.current.y - current.current.y) > 0.05;

      if (isMoving) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        rafId.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [driftFactor]);

  return { bgRef };
}
