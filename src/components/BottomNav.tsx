import { useNavStore, type TabId } from '@/store/navStore';
import { hapticFeedback } from '@tma.js/sdk-react';
import { Home, MapPin, Clock, Star, User } from 'lucide-react';

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'order', label: 'Заказать', Icon: MapPin },
  { id: 'trips', label: 'Поездки', Icon: Clock },
  { id: 'loyalty', label: 'Бонусы', Icon: Star },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb px-3 pb-3 pt-2">
      <div
        className="relative flex items-center justify-around rounded-2xl px-1 py-1"
        style={{
          background: 'rgba(6, 11, 24, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.1)',
          boxShadow: '0 -4px 30px rgba(0, 229, 255, 0.05)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { hapticFeedback.selectionChanged(); setActiveTab(id); }}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 transition-all duration-300 active:scale-90"
              aria-label={label}
            >
              <span
                className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300"
                style={isActive ? {
                  background: 'rgba(0, 229, 255, 0.12)',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.08)',
                } : {}}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-colors duration-300"
                  style={{ color: isActive ? '#00e5ff' : '#475569' }}
                />
              </span>
              <span
                className="text-[10px] font-semibold tracking-wide transition-all duration-300"
                style={{
                  color: isActive ? '#00e5ff' : '#475569',
                  textShadow: isActive ? '0 0 8px rgba(0, 229, 255, 0.5)' : 'none',
                }}
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
