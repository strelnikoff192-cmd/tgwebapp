import { Star, Gift, Copy, Share2, Users, Trophy, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { hapticFeedback } from '@tma.js/sdk-react';
import { UserCard } from '@/components/UserCard';
import { useReferralStore, REFERRAL_TIERS } from '@/store/referralStore';
import { useUserStore } from '@/store/userStore';

const LEVELS = [
  { name: 'Bronze', min: 0, color: '#cd7f32', icon: '🥉' },
  { name: 'Silver', min: 5000, color: '#c0c0c0', icon: '🥈' },
  { name: 'Gold', min: 15000, color: '#ffd700', icon: '🥇' },
  { name: 'Platinum', min: 30000, color: '#00e5ff', icon: '💎' },
];

export function LoyaltyPage() {
  const { bonusPoints, invitedFriends, getReferralLink, getCurrentDiscount } = useReferralStore();
  const { isAuthorized } = useUserStore();
  const [copied, setCopied] = useState(false);

  const currentLevel = LEVELS.findIndex((l, i) => {
    const next = LEVELS[i + 1];
    return !next || (bonusPoints >= l.min && bonusPoints < (next?.min ?? Infinity));
  });
  const nextLevel = LEVELS[currentLevel + 1];
  const progress = nextLevel
    ? ((bonusPoints - LEVELS[currentLevel].min) / (nextLevel.min - LEVELS[currentLevel].min)) * 100
    : 100;

  const discount = getCurrentDiscount();
  const referralLink = getReferralLink();

  const copyLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    hapticFeedback.notificationOccurred('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const shareViaTelegram = useCallback(() => {
    if (!referralLink) return;
    const text = encodeURIComponent(`Присоединяйся к Глобус Такси! Скидка 15% на первую поездку: ${referralLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  }, [referralLink]);

  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-black text-white mb-6 tracking-tight text-glow">Бонусы</h2>

      <div className="mb-5">
        <UserCard variant="compact" />
      </div>

      {/* Points & Level */}
      <div className="card-glow mb-5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Ваш уровень</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{LEVELS[currentLevel]?.icon}</span>
              <span className="text-lg font-black" style={{ color: LEVELS[currentLevel]?.color }}>{LEVELS[currentLevel]?.name}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Баллы</span>
            <div className="flex items-center gap-2 mt-1">
              <Star size={20} fill="#00e5ff" style={{ color: '#00e5ff' }} />
              <span className="text-xl font-black" style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.3)' }}>
                {bonusPoints.toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {nextLevel && (
          <div>
            <div className="flex justify-between text-[10px] font-semibold mb-1.5" style={{ color: '#64748b' }}>
              <span>{LEVELS[currentLevel]?.name}</span>
              <span>{nextLevel.name} ({nextLevel.min.toLocaleString('ru-RU')})</span>
            </div>
            <div className="progress-glow h-2.5 bg-white/5">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Current discount */}
      {discount > 0 && (
        <div className="card-glow mb-5 p-4 flex items-center gap-3" style={{ borderColor: 'rgba(0, 255, 136, 0.2)' }}>
          <Sparkles size={22} style={{ color: '#00ff88' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: '#00ff88' }}>Активная скидка: {discount}%</div>
            <div className="text-xs" style={{ color: '#64748b' }}>За {invitedFriends} приглашённых друзей</div>
          </div>
        </div>
      )}

      {/* Referral section */}
      <div className="card-glow mb-5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
            <Users size={20} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Приглашено друзей</div>
            <div className="text-2xl font-black" style={{ color: '#7c3aed' }}>{invitedFriends}</div>
          </div>
        </div>

        {/* Referral tiers */}
        <div className="space-y-2 mb-4">
          {REFERRAL_TIERS.map((tier) => {
            const achieved = invitedFriends >= tier.friends;
            return (
              <div
                key={tier.friends}
                className="flex items-center justify-between p-3 rounded-xl transition-all"
                style={{
                  background: achieved ? 'rgba(0, 229, 255, 0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${achieved ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Trophy size={16} style={{ color: achieved ? '#00e5ff' : '#334155' }} />
                  <span className="text-sm font-semibold" style={{ color: achieved ? '#e2e8f0' : '#475569' }}>
                    {tier.label}
                  </span>
                </div>
                <span className="text-sm font-black" style={{ color: achieved ? '#00e5ff' : '#334155' }}>
                  -{tier.discount}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share buttons */}
      {isAuthorized && referralLink && (
        <div className="space-y-3">
          <button type="button" onClick={shareViaTelegram} className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3">
            <Share2 size={20} />
            Поделиться в Telegram
          </button>

          <button type="button" onClick={copyLink} className="btn-secondary w-full py-3.5 rounded-xl flex items-center justify-center gap-2">
            <Copy size={16} />
            {copied ? 'Скопировано!' : 'Скопировать ссылку'}
          </button>

          <p className="text-center text-xs" style={{ color: '#64748b' }}>
            Друг получит -15% на первую поездку, вы — 500 баллов
          </p>
        </div>
      )}

      {!isAuthorized && (
        <div className="card-glow p-5 text-center">
          <Gift size={32} className="mx-auto mb-3" style={{ color: '#7c3aed' }} />
          <p className="text-sm text-white font-semibold mb-1">Войдите через Telegram</p>
          <p className="text-xs" style={{ color: '#64748b' }}>Откройте приложение через бота для доступа к бонусам</p>
        </div>
      )}
    </div>
  );
}
