const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '';
const SUGGEST_KEY = import.meta.env.VITE_YANDEX_SUGGEST_KEY ?? '';
let loadPromise: Promise<void> | null = null;

function buildScriptUrl(): string {
  const params = new URLSearchParams({ apikey: API_KEY, lang: 'ru_RU' });
  if (SUGGEST_KEY) params.set('suggest_apikey', SUGGEST_KEY);
  return `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
}

export function loadYandexMaps(): Promise<void> {
  if (!API_KEY) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = buildScriptUrl();
    script.async = true;
    script.onload = () => {
      window.ymaps?.ready(() => resolve());
    };
    script.onerror = () => reject(new Error('Yandex Maps load failed'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function hasYandexMapsKey(): boolean {
  return Boolean(API_KEY);
}
