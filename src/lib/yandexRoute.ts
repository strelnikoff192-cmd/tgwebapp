/**
 * Расчёт расстояния между адресами через REST API Яндекса
 * (Геокодер + Distance Matrix) — без карты и JS API.
 */

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '';

export function hasRouteApiKey(): boolean {
  return Boolean(API_KEY);
}

/** Геокодирование: адрес → [широта, долгота] */
async function geocode(address: string): Promise<[number, number] | null> {
  if (!API_KEY) return null;
  const url = `https://geocode-maps.yandex.ru/v1/?apikey=${encodeURIComponent(API_KEY)}&geocode=${encodeURIComponent(address)}&lang=ru_RU&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const members = data?.response?.GeoObjectCollection?.featureMember;
    if (!Array.isArray(members) || members.length === 0) return null;
    const pos = members[0]?.GeoObject?.Point?.pos;
    if (typeof pos !== 'string') return null;
    const [lon, lat] = pos.trim().split(/\s+/).map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [lat, lon]; // для Distance Matrix нужен формат lat,lon
  } catch {
    return null;
  }
}

/**
 * Расстояние между двумя адресами в километрах.
 * Возвращает null при ошибке или если адрес не найден.
 */
export async function getRouteDistanceKm(fromAddress: string, toAddress: string): Promise<number | null> {
  if (!API_KEY || !fromAddress.trim() || !toAddress.trim()) return null;
  const from = await geocode(fromAddress.trim());
  const to = await geocode(toAddress.trim());
  if (!from || !to) return null;
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const origins = `${lat1},${lon1}`;
  const destinations = `${lat2},${lon2}`;
  const url = `https://api.routing.yandex.net/v2/distancematrix?apikey=${encodeURIComponent(API_KEY)}&origins=${origins}&destinations=${destinations}&mode=driving`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const rows = data?.rows;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const el = rows[0]?.elements?.[0];
    if (el?.status !== 'OK') return null;
    const distance = el?.distance?.value; // метры
    if (typeof distance !== 'number' || !Number.isFinite(distance)) return null;
    return Math.round((distance / 1000) * 10) / 10;
  } catch {
    return null;
  }
}
