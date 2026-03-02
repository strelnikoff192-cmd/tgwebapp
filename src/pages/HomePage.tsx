import { useEffect, useRef } from 'react';
import { useNavStore } from '@/store/navStore';
import { useUserStore } from '@/store/userStore';
import { useTripsStore } from '@/store/tripsStore';
import { useReferralStore } from '@/store/referralStore';
import { Star, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
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
    return () => { mapInstanceRef.current?.destroy(); mapInstanceRef.current = null; };
  }, []);

  const firstName = displayName.split(' ')[0];
  const greeting = isAuthorized ? `${firstName}, куда едем?` : 'Куда едем?';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: '#737373' }}>Глобус Такси</p>
            <h1 className="text-[22px] font-bold text-white mt-0.5">{greeting}</h1>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-sm font-bold" style={{ color: '#d4a853' }}>
              {isAuthorized ? firstName.charAt(0) : '?'}
            </span>
          </button>
        </div>
      </header>

      {/* Quick stats row */}
      <div className="shrink-0 px-5 mb-4 flex gap-2.5">
        <button onClick={() => setActiveTab('trips')} className="card-glow flex-1 p-3 flex items-center gap-2.5 transition-all active:scale-[0.97]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(212, 168, 83, 0.1)' }}>
            <Clock size={17} style={{ color: '#d4a853' }} />
          </span>
          <div>
            <div className="text-base font-bold text-white leading-tight">{tripsCount}</div>
            <div className="text-[10px] font-medium" style={{ color: '#737373' }}>поездок</div>
          </div>
        </button>
        <button onClick={() => setActiveTab('loyalty')} className="card-glow flex-1 p-3 flex items-center gap-2.5 transition-all active:scale-[0.97]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(212, 168, 83, 0.1)' }}>
            <Star size={17} style={{ color: '#d4a853' }} />
          </span>
          <div>
            <div className="text-base font-bold text-white leading-tight">{bonusPoints}</div>
            <div className="text-[10px] font-medium" style={{ color: '#737373' }}>баллов</div>
          </div>
        </button>
        <button onClick={() => setActiveTab('loyalty')} className="card-glow flex-1 p-3 flex items-center gap-2.5 transition-all active:scale-[0.97]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(212, 168, 83, 0.1)' }}>
            <Users size={17} style={{ color: '#d4a853' }} />
          </span>
          <div>
            <div className="text-base font-bold text-white leading-tight">{invitedFriends}</div>
            <div className="text-[10px] font-medium" style={{ color: '#737373' }}>друзей</div>
          </div>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[200px] relative overflow-hidden rounded-2xl mx-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        {!hasYandexMapsKey() && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#141414' }}>
            <MapPin size={32} style={{ color: '#525252' }} className="mb-2" />
            <p className="text-xs px-6 text-center" style={{ color: '#525252' }}>
              Добавьте VITE_YANDEX_MAPS_API_KEY
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0 p-4 pt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className="btn-primary w-full py-4 px-5 rounded-2xl text-base flex items-center justify-center gap-2.5 min-h-[54px]"
        >
          <MapPin size={20} className="shrink-0" />
          Заказать поездку
          <ChevronRight size={18} className="ml-auto opacity-60" />
        </button>
      </div>
    </div>
  );
}
