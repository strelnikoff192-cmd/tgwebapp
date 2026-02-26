import { Star, Gift, Copy } from 'lucide-react';
import { useCallback } from 'react';
import { hapticFeedback } from '@tma.js/sdk-react';

const LEVELS = [
  { name: 'Bronze', min: 0, color: '#cd7f32' },
  { name: 'Silver', min: 5000, color: '#c0c0c0' },
  { name: 'Gold', min: 15000, color: '#ffd700' },
];

const POINTS = 12480;
const CURRENT_LEVEL = LEVELS.findIndex((l, i) => {
  const next = LEVELS[i + 1];
  return !next || (POINTS >= l.min && POINTS < (next?.min ?? Infinity));
});
const NEXT_LEVEL = LEVELS[CURRENT_LEVEL + 1];
const PROGRESS = NEXT_LEVEL
  ? ((POINTS - LEVELS[CURRENT_LEVEL].min) / (NEXT_LEVEL.min - LEVELS[CURRENT_LEVEL].min)) * 100
  : 100;

export function LoyaltyPage() {
  const inviteCode = 'GLOBUS-2025';

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(inviteCode);
    hapticFeedback.notificationOccurred('success');
    // Could show a small toast here
  }, []);

  return (
    <div className="p-4 pb-8 view-enter">
      <h2 className="text-xl font-bold text-white mb-4">Лояльность</h2>

      <div className="mb-6 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400">Ваши баллы</span>
          <span className="text-2xl font-bold text-[var(--color-accent)] flex items-center gap-1">
            <Star size={24} fill="currentColor" />
            {POINTS.toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{LEVELS[CURRENT_LEVEL]?.name ?? 'Gold'}</span>
            {NEXT_LEVEL && <span>{NEXT_LEVEL.name}</span>}
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${PROGRESS}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-bg)] border border-[var(--color-border)] text-center">
        <p className="text-slate-400 text-sm mb-2">Виртуальная карта</p>
        <div className="w-32 h-20 mx-auto mb-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded" title="QR" />
        </div>
        <p className="text-xs text-slate-500">Предъявите карту при поездке</p>
      </div>

      <button
        type="button"
        onClick={copyCode}
        className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Gift size={20} />
        Пригласить друга +500 баллов
      </button>
      <p className="text-center text-slate-500 text-sm mt-2">
        Код: {inviteCode}
        <button
          type="button"
          onClick={copyCode}
          className="ml-2 inline-flex items-center gap-1 text-[var(--color-accent)]"
        >
          <Copy size={14} />
        </button>
      </p>
    </div>
  );
}
