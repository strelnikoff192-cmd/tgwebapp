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
      <h2 className="text-xl font-bold text-white mb-5">Профиль</h2>

      <div className="mb-5">
        <UserCard variant="full" linkToProfile={false} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="card-glow p-3 text-center">
          <div className="text-base font-bold text-white">{tripsCount}</div>
          <div className="text-[10px] font-medium" style={{ color: '#737373' }}>Поездок</div>
        </div>
        <div className="card-glow p-3 text-center">
          <div className="text-base font-bold" style={{ color: '#d4a853' }}>{bonusPoints}</div>
          <div className="text-[10px] font-medium" style={{ color: '#737373' }}>Баллов</div>
        </div>
        <div className="card-glow p-3 text-center">
          <div className="text-base font-bold text-white">{totalSpent.toLocaleString('ru-RU')} ₽</div>
          <div className="text-[10px] font-medium" style={{ color: '#737373' }}>Потрачено</div>
        </div>
      </div>

      {/* TG info */}
      {isAuthorized && tgUser && (
        <div className="space-y-2 mb-5">
          {([
            { icon: UserIcon, label: 'Имя', value: displayName, bg: 'rgba(212,168,83,0.08)', clr: '#d4a853' },
            tgUser.username ? { icon: AtSign, label: 'Username', value: `@${tgUser.username}`, bg: 'rgba(212,168,83,0.08)', clr: '#d4a853' } : null,
            { icon: Hash, label: 'Telegram ID', value: String(tgUser.id), bg: 'rgba(255,255,255,0.04)', clr: '#a3a3a3' },
            tgUser.language_code ? { icon: Globe, label: 'Язык', value: tgUser.language_code.toUpperCase(), bg: 'rgba(255,255,255,0.04)', clr: '#a3a3a3' } : null,
          ].filter(Boolean) as { icon: typeof UserIcon; label: string; value: string; bg: string; clr: string }[]).map((item) => (
            <div key={item.label} className="card-solid flex items-center gap-3.5 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: item.bg }}>
                <item.icon size={17} style={{ color: item.clr }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium" style={{ color: '#737373' }}>{item.label}</div>
                <div className="text-sm font-semibold text-white truncate">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAuthorized && (
        <div className="card-glow p-6 text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#1a1a1a' }}>
            <UserIcon size={26} style={{ color: '#525252' }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Гостевой режим</h3>
          <p className="text-xs" style={{ color: '#525252' }}>
            Откройте через Telegram бота
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2.5" style={{ color: '#737373' }}>Настройки</p>
        <button
          type="button"
          onClick={() => setNotifications(!notifications)}
          className="card-solid flex items-center gap-3.5 p-3.5 w-full text-left transition-all active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: notifications ? 'rgba(212,168,83,0.08)' : 'rgba(255,255,255,0.04)' }}>
            {notifications ? <Bell size={17} style={{ color: '#d4a853' }} /> : <BellOff size={17} style={{ color: '#525252' }} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">Уведомления</div>
            <div className="text-xs" style={{ color: '#737373' }}>{notifications ? 'Включены' : 'Выключены'}</div>
          </div>
          <div className="w-10 h-[22px] rounded-full p-0.5 transition-all" style={{ background: notifications ? '#d4a853' : '#333' }}>
            <div className="w-[18px] h-[18px] rounded-full bg-black transition-transform" style={{ transform: notifications ? 'translateX(18px)' : 'translateX(0)' }} />
          </div>
        </button>
      </div>

      {/* Referral */}
      <div className="card-glow p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Share2 size={17} style={{ color: '#737373' }} />
          <div>
            <div className="text-sm font-semibold text-white">Приглашено</div>
            <div className="text-xs" style={{ color: '#737373' }}>{invitedFriends} друзей</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: '#d4a853' }}>+{bonusPoints}</div>
          <div className="text-[10px]" style={{ color: '#737373' }}>баллов</div>
        </div>
      </div>
    </div>
  );
}
