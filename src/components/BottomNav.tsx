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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb px-3 pb-3 pt-2">
      <div
        className="flex items-center justify-around rounded-2xl px-2 py-2 shadow-lg"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { hapticFeedback.selectionChanged(); setActiveTab(id); }}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 transition-all duration-200 active:scale-95"
              aria-label={label}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-slate-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span
                className={`text-[11px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-slate-500'
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
