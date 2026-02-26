import { Star, Gift, Copy } from 'lucide-react';
import { useCallback } from 'react';
import { hapticFeedback } from '@tma.js/sdk-react';
import { UserCard } from '@/components/UserCard';

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
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Лояльность</h2>

      <div className="mb-5">
        <UserCard variant="compact" />
      </div>
      <p className="text-slate-400 text-sm mb-4">Баллы и уровень привязаны к вашему профилю в Telegram.</p>

      <div className="card-solid mb-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium">Ваши баллы</span>
          <span className="text-2xl font-bold text-[var(--color-accent)] flex items-center gap-2">
            <Star size={26} fill="currentColor" />
            {POINTS.toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>{LEVELS[CURRENT_LEVEL]?.name ?? 'Gold'}</span>
            {NEXT_LEVEL && <span>{NEXT_LEVEL.name}</span>}
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${PROGRESS}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card-solid mb-6 p-6 text-center border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent">
        <p className="text-slate-400 text-sm font-medium mb-3">Виртуальная карта</p>
        <div className="w-36 h-24 mx-auto mb-4 rounded-xl bg-white/5 border border-[var(--color-border)] flex items-center justify-center">
          <div className="w-20 h-20 bg-white/10 rounded-lg" title="QR" />
        </div>
        <p className="text-xs text-slate-500">Предъявите карту при поездке</p>
      </div>

      <button
        type="button"
        onClick={copyCode}
        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3"
      >
        <Gift size={22} />
        Пригласить друга +500 баллов
      </button>
      <p className="text-center text-slate-500 text-sm mt-4">
        Код: {inviteCode}
        <button
          type="button"
          onClick={copyCode}
          className="ml-2 inline-flex items-center gap-1.5 text-[var(--color-accent)] font-medium"
        >
          <Copy size={16} />
        </button>
      </p>
    </div>
  );
}
