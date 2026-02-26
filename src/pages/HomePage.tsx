import { useEffect, useRef } from 'react';
import { useNavStore } from '@/store/navStore';
import { Star, MapPin } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="shrink-0 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-bold shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
            }}
          >
            <span className="text-lg">Г</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Глобус Такси</h1>
            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className="mt-0.5 flex items-center gap-1.5 text-[var(--color-accent)] text-sm font-medium"
            >
              <Star size={16} fill="currentColor" />
              12 480 баллов
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-[200px] relative overflow-hidden rounded-2xl mx-4">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        {!hasYandexMapsKey() && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-solid)] rounded-2xl">
            <p className="text-slate-400 text-sm px-4 text-center">
              Добавьте VITE_YANDEX_MAPS_API_KEY в .env для отображения карты
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 pt-5">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className="btn-primary w-full py-4 px-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 min-h-[56px]"
        >
          <MapPin size={24} className="shrink-0" />
          <span className="truncate">Построить маршрут</span>
        </button>
      </div>
    </div>
  );
}
