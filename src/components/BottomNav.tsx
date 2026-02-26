import { useNavStore, type TabId } from '@/store/navStore';
import { hapticFeedback } from '@tma.js/sdk-react';
import { Home, MapPin, Clock, Star, User } from 'lucide-react';

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'order', label: 'Заказать', Icon: MapPin },
  { id: 'trips', label: 'Поездки', Icon: Clock },
  { id: 'loyalty', label: 'Лояльность', Icon: Star },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { hapticFeedback.selectionChanged(); setActiveTab(id); }}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 transition-all duration-200 active:scale-95"
              aria-label={label}
            >
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-slate-400'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-slate-400'
                }`}
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
