import { User as UserIcon, Hash, AtSign, Globe, Bell, BellOff, Share2 } from 'lucide-react';
import { UserCard } from '@/components/UserCard';
import { useUserStore } from '@/store/userStore';
import { useTripsStore } from '@/store/tripsStore';
import { useReferralStore } from '@/store/referralStore';
import { useState } from 'react';

export function ProfilePage() {
  const { tgUser, isAuthorized, displayName } = useUserStore();
  const tripsCount = useTripsStore((s) => s.trips.length);
  const totalSpent = useTripsStore((s) => s.trips.reduce((sum, t) => sum + t.price, 0));
  const { bonusPoints, invitedFriends } = useReferralStore();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-black text-white mb-6 tracking-tight text-glow">Профиль</h2>

      <div className="mb-6">
        <UserCard variant="full" linkToProfile={false} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-glow p-3 text-center">
          <div className="text-lg font-black text-white">{tripsCount}</div>
          <div className="text-[10px] font-semibold" style={{ color: '#64748b' }}>Поездок</div>
        </div>
        <div className="card-glow p-3 text-center">
          <div className="text-lg font-black" style={{ color: '#00e5ff' }}>{bonusPoints}</div>
          <div className="text-[10px] font-semibold" style={{ color: '#64748b' }}>Баллов</div>
        </div>
        <div className="card-glow p-3 text-center">
          <div className="text-lg font-black text-white">{totalSpent.toLocaleString('ru-RU')} ₽</div>
          <div className="text-[10px] font-semibold" style={{ color: '#64748b' }}>Потрачено</div>
        </div>
      </div>

      {/* Telegram info */}
      {isAuthorized && tgUser && (
        <div className="space-y-2 mb-6">
          <div className="card-solid flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
              <UserIcon size={20} style={{ color: '#00e5ff' }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs" style={{ color: '#64748b' }}>Имя</div>
              <div className="text-white font-semibold truncate">{displayName}</div>
            </div>
          </div>

          {tgUser.username && (
            <div className="card-solid flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                <AtSign size={20} style={{ color: '#7c3aed' }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs" style={{ color: '#64748b' }}>Username</div>
                <div className="text-white font-semibold truncate">@{tgUser.username}</div>
              </div>
            </div>
          )}

          <div className="card-solid flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255, 45, 120, 0.1)' }}>
              <Hash size={20} style={{ color: '#ff2d78' }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs" style={{ color: '#64748b' }}>Telegram ID</div>
              <div className="text-white font-semibold">{tgUser.id}</div>
            </div>
          </div>

          {tgUser.language_code && (
            <div className="card-solid flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                <Globe size={20} style={{ color: '#00ff88' }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs" style={{ color: '#64748b' }}>Язык</div>
                <div className="text-white font-semibold">{tgUser.language_code.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isAuthorized && (
        <div className="card-glow p-6 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
            <UserIcon size={32} style={{ color: '#00e5ff' }} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Гостевой режим</h3>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Откройте приложение через Telegram бота для полного доступа
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-bold mb-3" style={{ color: '#64748b' }}>Настройки</h3>
        <button
          type="button"
          onClick={() => setNotifications(!notifications)}
          className="card-solid flex items-center gap-4 p-4 w-full text-left transition-all active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: notifications ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.04)' }}>
            {notifications ? <Bell size={20} style={{ color: '#00e5ff' }} /> : <BellOff size={20} style={{ color: '#475569' }} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">Уведомления</div>
            <div className="text-xs" style={{ color: '#64748b' }}>{notifications ? 'Включены' : 'Выключены'}</div>
          </div>
          <div
            className="w-11 h-6 rounded-full p-0.5 transition-all"
            style={{ background: notifications ? '#00e5ff' : 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: notifications ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
        </button>
      </div>

      {/* Referral stats */}
      <div className="card-glow p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Share2 size={20} style={{ color: '#7c3aed' }} />
          <div>
            <div className="text-sm font-bold text-white">Приглашено</div>
            <div className="text-xs" style={{ color: '#64748b' }}>{invitedFriends} друзей</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black" style={{ color: '#00e5ff' }}>+{bonusPoints}</div>
          <div className="text-[10px]" style={{ color: '#64748b' }}>баллов</div>
        </div>
      </div>
    </div>
  );
}
