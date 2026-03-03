import { Star, Copy, Share2, Users, Trophy, Gift } from 'lucide-react';
import { useCallback, useState } from 'react';
import { hapticFeedback } from '@tma.js/sdk-react';
import { UserCard } from '@/components/UserCard';
import { useReferralStore, REFERRAL_TIERS, MAX_DISCOUNT } from '@/store/referralStore';
import { useUserStore } from '@/store/userStore';

const LEVELS = [
  { name: 'Bronze', min: 0, color: '#a3a3a3' },
  { name: 'Silver', min: 5000, color: '#d4d4d4' },
  { name: 'Gold', min: 15000, color: '#d4a853' },
  { name: 'Platinum', min: 30000, color: '#e5e5e5' },
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
    const text = encodeURIComponent(`Присоединяйся к Глобус Такси! Скидка ${MAX_DISCOUNT}% на первую поездку: ${referralLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  }, [referralLink]);

  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-xl font-bold text-white mb-5">Бонусы</h2>

      <div className="mb-5">
        <UserCard variant="compact" />
      </div>

      {/* Points & Level */}
      <div className="card-glow mb-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium" style={{ color: '#737373' }}>Уровень</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: LEVELS[currentLevel]?.color }}>
              {LEVELS[currentLevel]?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: '#737373' }}>Баллы</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={16} fill="#d4a853" style={{ color: '#d4a853' }} />
              <span className="text-lg font-bold" style={{ color: '#d4a853' }}>
                {bonusPoints.toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {nextLevel && (
          <div>
            <div className="flex justify-between text-[10px] font-medium mb-1.5" style={{ color: '#737373' }}>
              <span>{LEVELS[currentLevel]?.name}</span>
              <span>{nextLevel.name} — {nextLevel.min.toLocaleString('ru-RU')}</span>
            </div>
            <div className="progress-glow h-2 bg-white/5">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Active discount */}
      {discount > 0 && (
        <div className="card-glow mb-4 p-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
            <Trophy size={17} style={{ color: '#34d399' }} />
          </span>
          <div>
            <span className="text-sm font-semibold" style={{ color: '#34d399' }}>Скидка {discount}%</span>
            <span className="text-xs ml-2" style={{ color: '#737373' }}>за {invitedFriends} друзей</span>
          </div>
        </div>
      )}

      {/* Referral section */}
      <div className="card-glow mb-4 p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(212, 168, 83, 0.1)' }}>
            <Users size={17} style={{ color: '#d4a853' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Приглашено друзей</p>
            <p className="text-lg font-bold" style={{ color: '#d4a853' }}>{invitedFriends}</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-1.5">
          {REFERRAL_TIERS.map((tier) => {
            const achieved = invitedFriends >= tier.friends;
            return (
              <div
                key={tier.friends}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                style={{ background: achieved ? 'rgba(212, 168, 83, 0.06)' : 'transparent' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: achieved ? '#d4a853' : '#333' }} />
                  <span className="text-sm" style={{ color: achieved ? '#e5e5e5' : '#525252' }}>{tier.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: achieved ? '#d4a853' : '#333' }}>
                  -{tier.discount}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share */}
      {isAuthorized && referralLink && (
        <div className="space-y-2.5">
          <button type="button" onClick={shareViaTelegram} className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm">
            <Share2 size={18} />
            Пригласить друга
          </button>
          <button type="button" onClick={copyLink} className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
            <Copy size={15} />
            {copied ? 'Скопировано!' : 'Скопировать ссылку'}
          </button>
          <p className="text-center text-xs" style={{ color: '#525252' }}>
            Друг получит -{MAX_DISCOUNT}% на первую поездку, вы — 500 баллов
          </p>
        </div>
      )}

      {!isAuthorized && (
        <div className="card-glow p-6 text-center">
          <Gift size={28} className="mx-auto mb-3" style={{ color: '#525252' }} />
          <p className="text-sm font-semibold text-white mb-1">Войдите через Telegram</p>
          <p className="text-xs" style={{ color: '#525252' }}>Откройте через бота для доступа к бонусам</p>
        </div>
      )}
    </div>
  );
}
