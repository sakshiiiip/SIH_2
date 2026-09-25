import React, { useState, useEffect } from 'react';

interface BreakCountdownTimerProps {
  startedAt?: string;
  durationMins: number;
  onExpire?: () => void;
  className?: string;
}

export const BreakCountdownTimer: React.FC<BreakCountdownTimerProps> = ({
  startedAt,
  durationMins,
  onExpire,
  className = '',
}) => {
  const calculateRemaining = () => {
    if (!startedAt) {
      return durationMins * 60;
    }
    const startMs = new Date(startedAt).getTime();
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    const totalSec = Math.max(1, durationMins * 60);
    return Math.max(0, totalSec - elapsedSec);
  };

  const [remainingSec, setRemainingSec] = useState<number>(calculateRemaining);

  useEffect(() => {
    setRemainingSec(calculateRemaining());

    const timer = setInterval(() => {
      const rem = calculateRemaining();
      setRemainingSec(rem);

      if (rem <= 0) {
        clearInterval(timer);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, durationMins]);

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <span className={`font-mono font-bold tracking-wider ${className}`}>
      {formatted}
    </span>
  );
};
