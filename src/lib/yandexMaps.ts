const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '';
let loadPromise: Promise<void> | null = null;

export function loadYandexMaps(): Promise<void> {
  if (!API_KEY) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/v2.1/?apikey=${API_KEY}&lang=ru_RU&load=package.suggest`;
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
