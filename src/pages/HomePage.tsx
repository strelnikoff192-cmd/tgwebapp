import { useEffect, useRef } from 'react';
import { useNavStore } from '@/store/navStore';
import { useUserStore } from '@/store/userStore';
import { useTripsStore } from '@/store/tripsStore';
import { useReferralStore } from '@/store/referralStore';
import { Star, MapPin, Clock, Users, Zap } from 'lucide-react';
import { loadYandexMaps, hasYandexMapsKey } from '@/lib/yandexMaps';

declare global {
  interface Window {
    ymaps?: {
      ready: (fn: () => void) => void;
      Map: new (
        element: string | HTMLElement,
        state: { center: number[]; zoom: number; controls?: string[] }
      ) => { destroy: () => void };
    };
  }
}

export function HomePage() {
  const setActiveTab = useNavStore((s) => s.setActiveTab);
  const { displayName, isAuthorized } = useUserStore();
  const tripsCount = useTripsStore((s) => s.trips.length);
  const { bonusPoints, invitedFriends } = useReferralStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!hasYandexMapsKey() || !mapRef.current) return;
    loadYandexMaps().then(() => {
      if (!mapRef.current) return;
      mapInstanceRef.current = new window.ymaps!.Map(mapRef.current, {
        center: [55.7558, 37.6173],
        zoom: 11,
        controls: [],
      });
    });
    return () => {
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
  }, []);

  const greeting = isAuthorized ? `Привет, ${displayName.split(' ')[0]}!` : 'Добро пожаловать!';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Hero header */}
      <header className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          {/* Animated logo */}
          <div
            className="flex h-13 w-13 items-center justify-center rounded-2xl text-white font-black text-xl animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #7c3aed 100%)',
            }}
          >
            G
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white tracking-tight text-glow">
              {greeting}
            </h1>
            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className="mt-1 flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#00e5ff' }}
            >
              <Star size={16} fill="currentColor" />
              {bonusPoints.toLocaleString('ru-RU')} баллов
            </button>
          </div>
        </div>

        {/* Orbital decorative elements */}
        <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full">
          <div className="animate-shimmer absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)', backgroundSize: '200% 100%' }} />
        </div>
      </header>

      {/* Quick stats */}
      <div className="shrink-0 px-5 mb-4 grid grid-cols-3 gap-3">
        <button onClick={() => setActiveTab('trips')} className="card-glow p-3 text-center transition-all active:scale-95">
          <Clock size={20} className="mx-auto mb-1" style={{ color: '#00e5ff' }} />
          <div className="text-lg font-bold text-white">{tripsCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Поездок</div>
        </button>
        <button onClick={() => setActiveTab('loyalty')} className="card-glow p-3 text-center transition-all active:scale-95">
          <Users size={20} className="mx-auto mb-1" style={{ color: '#7c3aed' }} />
          <div className="text-lg font-bold text-white">{invitedFriends}</div>
          <div className="text-[10px] text-slate-500 font-medium">Друзей</div>
        </button>
        <button onClick={() => setActiveTab('loyalty')} className="card-glow p-3 text-center transition-all active:scale-95">
          <Zap size={20} className="mx-auto mb-1" style={{ color: '#ff2d78' }} />
          <div className="text-lg font-bold text-white">{useReferralStore.getState().getCurrentDiscount()}%</div>
          <div className="text-[10px] text-slate-500 font-medium">Скидка</div>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[200px] relative overflow-hidden rounded-2xl mx-4" style={{ border: '1px solid rgba(0, 229, 255, 0.1)' }}>
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        {!hasYandexMapsKey() && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'var(--color-surface-solid)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
              <MapPin size={28} style={{ color: '#00e5ff' }} />
            </div>
            <p className="text-slate-500 text-sm px-4 text-center">
              Добавьте VITE_YANDEX_MAPS_API_KEY
            </p>
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="shrink-0 p-4 pt-5">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className="btn-primary w-full py-4 px-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 min-h-[56px]"
        >
          <MapPin size={24} className="shrink-0" />
          <span className="truncate">Построить маршрут</span>
        </button>
      </div>
    </div>
  );
}
