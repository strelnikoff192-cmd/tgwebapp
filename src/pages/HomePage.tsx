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
    <div className="flex flex-col h-full min-h-[100dvh]">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">Г</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Глобус Такси</h1>
            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className="flex items-center gap-1 text-[var(--color-accent)] text-sm font-medium"
            >
              <Star size={14} fill="currentColor" />
              12 480 баллов
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative min-h-[300px]">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        {!hasYandexMapsKey() && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
            <p className="text-slate-400 text-sm px-4">
              Добавьте VITE_YANDEX_MAPS_API_KEY в .env для отображения карты
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 bg-[var(--color-bg)]">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-bold text-lg shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2"
        >
          <MapPin size={22} />
          Построить маршрут
        </button>
      </div>
    </div>
  );
}
