import { useMemo } from 'react';
import { useNavStore, type TabId } from '@/store/navStore';
import { useUserStore } from '@/store/userStore';
import { isAdminUser } from '@/lib/adminAuth';
import { hapticFeedback } from '@tma.js/sdk-react';
import { Home, MapPin, Clock, Star, User, Shield } from 'lucide-react';

const baseTabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'order', label: 'Заказать', Icon: MapPin },
  { id: 'trips', label: 'Поездки', Icon: Clock },
  { id: 'loyalty', label: 'Бонусы', Icon: Star },
  { id: 'profile', label: 'Профиль', Icon: User },
];

const adminTab: { id: TabId; label: string; Icon: typeof Home } = {
  id: 'admin', label: 'Админ', Icon: Shield,
};

export function BottomNav() {
  const { activeTab, setActiveTab } = useNavStore();
  const tgUser = useUserStore((s) => s.tgUser);
  const showAdmin = isAdminUser(tgUser?.id ?? null);

  const tabs = useMemo(
    () => (showAdmin ? [...baseTabs, adminTab] : baseTabs),
    [showAdmin],
  );

  const iconSize = tabs.length > 5 ? 19 : 21;
  const textSize = tabs.length > 5 ? '9px' : '10px';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div
        className="flex items-center justify-around px-2 py-1.5"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { hapticFeedback.selectionChanged(); setActiveTab(id); }}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 transition-all duration-200 active:scale-90"
              aria-label={label}
            >
              <span
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
                style={isActive ? {
                  background: 'rgba(212, 168, 83, 0.12)',
                } : {}}
              >
                <Icon
                  size={iconSize}
                  strokeWidth={isActive ? 2.4 : 1.6}
                  style={{ color: isActive ? '#d4a853' : '#525252' }}
                  className="transition-colors duration-200"
                />
              </span>
              <span
                className="font-semibold transition-colors duration-200"
                style={{ color: isActive ? '#d4a853' : '#525252', fontSize: textSize }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
