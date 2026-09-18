import React, { useState, useEffect } from 'react';
import { BREAK_OPTIONS } from '../../data/workerMockData';
import { Coffee, UtensilsCrossed, Timer, Play, Clock } from 'lucide-react';

interface BreakSelectorProps {
  onStartBreak: (breakType: string, durationMinutes: number) => void;
  onResumeWork: () => void;
  isOnBreak: boolean;
  breakLabel?: string;
  breakEndsAt?: Date | null;
}

const BREAK_ICONS: Record<string, React.ReactNode> = {
  short:  <Coffee className="w-4 h-4" />,
  lunch:  <UtensilsCrossed className="w-4 h-4" />,
  custom: <Timer className="w-4 h-4" />,
};

function formatCountdown(endsAt: Date): string {
  const diffMs = endsAt.getTime() - Date.now();
  if (diffMs <= 0) return '00:00';
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const BreakSelector: React.FC<BreakSelectorProps> = ({
  onStartBreak,
  onResumeWork,
  isOnBreak,
  breakLabel = 'On Break',
  breakEndsAt = null,
}) => {
  const [selectedBreak, setSelectedBreak] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!breakEndsAt) { setCountdown(''); return; }
    const tick = () => setCountdown(formatCountdown(breakEndsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [breakEndsAt]);

  // --- ACTIVE BREAK VIEW ---
  if (isOnBreak) {
    return (
      <div className="p-4 bg-[#FFF8F3] border-2 border-[#F4DCD3] rounded-2xl space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E8A07A] animate-pulse" />
          <span className="text-sm font-bold text-[#80432E]">🟡 {breakLabel}</span>
          <span className="ml-auto text-xs text-[#77736B]">Temporarily unavailable for new jobs</span>
        </div>

        {breakEndsAt && countdown && (
          <div className="flex items-center gap-2 p-3 bg-[#FAEDE8] border border-[#F4DCD3] rounded-xl">
            <Clock className="w-4 h-4 text-[#80432E]" />
            <span className="text-xs text-[#80432E]">Break ends in</span>
            <span className="text-lg font-bold font-mono text-[#80432E] ml-auto">{countdown}</span>
          </div>
        )}

        <p className="text-xs text-[#77736B]">
          The cooperative dispatch system will not assign new jobs while you are on break.
        </p>

        <button
          type="button"
          onClick={onResumeWork}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6E8B67] hover:bg-[#587352] text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          Resume Work
        </button>
      </div>
    );
  }

  // --- BREAK SELECTION VIEW ---
  return (
    <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">Take a Break</h3>
      <div className="grid grid-cols-3 gap-2">
        {BREAK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedBreak(opt.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              selectedBreak === opt.id
                ? 'border-[#B37055] bg-[#FAEDE8] text-[#80432E]'
                : 'border-[#E8E2D5] bg-white text-[#524E47] hover:border-[#D8CFBE] hover:bg-[#F9F5EE]'
            }`}
          >
            <span className="text-lg">{opt.icon}</span>
            {BREAK_ICONS[opt.id]}
            <span className="text-center leading-tight">
              {opt.label}
              {opt.durationMinutes > 0 && (
                <span className="block text-[10px] font-normal text-[#9A958B]">{opt.durationMinutes} min</span>
              )}
            </span>
          </button>
        ))}
      </div>

      {selectedBreak === 'custom' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#77736B] shrink-0">Duration (min):</label>
          <input
            type="number"
            min={5}
            max={120}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="w-20 px-3 py-1.5 border border-[#E8E2D5] rounded-xl text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#B37055]"
          />
          <span className="text-xs text-[#77736B]">minutes</span>
        </div>
      )}

      {selectedBreak && (
        <button
          type="button"
          onClick={() => {
            const opt = BREAK_OPTIONS.find((o) => o.id === selectedBreak);
            const duration = selectedBreak === 'custom' ? customMinutes : (opt?.durationMinutes ?? 15);
            onStartBreak(selectedBreak, duration);
          }}
          className="w-full px-4 py-2.5 bg-[#B37055] hover:bg-[#9C583E] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Start {BREAK_OPTIONS.find((o) => o.id === selectedBreak)?.label}
        </button>
      )}
    </div>
  );
};
