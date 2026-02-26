import { useEffect, useRef, useState, useCallback } from 'react';
import { mainButton, hapticFeedback } from '@tma.js/sdk-react';
import { Car, Truck, Briefcase, CircleDollarSign } from 'lucide-react';

import { loadYandexMaps, hasYandexMapsKey } from '@/lib/yandexMaps';

const TARIFFS = [
  { id: 'economy', name: 'Эконом', pricePerKm: 30, Icon: Car },
  { id: 'comfort', name: 'Комфорт', pricePerKm: 35, Icon: Car },
  { id: 'minivan', name: 'Минивэн', pricePerKm: 50, Icon: Truck },
  { id: 'business', name: 'Бизнес', pricePerKm: 55, Icon: Briefcase },
] as const;

type TariffId = (typeof TARIFFS)[number]['id'];


export function OrderPage() {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromSuggestOpen, setFromSuggestOpen] = useState(false);
  const [toSuggestOpen, setToSuggestOpen] = useState(false);
  const [fromSuggests, setFromSuggests] = useState<string[]>([]);
  const [toSuggests, setToSuggests] = useState<string[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [selectedTariff, setSelectedTariff] = useState<TariffId>('comfort');
  const [dateTime, setDateTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const suggestTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0);
  const handleMainButtonRef = useRef<() => void>(() => {});

  const tariff = TARIFFS.find((t) => t.id === selectedTariff)!;
  const totalPrice = distanceKm != null && distanceKm > 0 ? Math.round(distanceKm * tariff.pricePerKm) : null;

  const loadRoute = useCallback(() => {
    if (!fromAddress.trim() || !toAddress.trim()) return;
    loadYandexMaps().then(() => {
      const ymaps = window.ymaps as unknown as {
        ready: (fn: () => void) => void;
        geocode: (q: string) => Promise<{ geoObjects: { get: (i: number) => { geometry?: { getCoordinates: () => number[] } } } }>;
        route: (points: number[][]) => Promise<{ getLength: () => number }>;
      };
      if (!ymaps) return;
      ymaps.ready(() => {
        Promise.all([ymaps.geocode(fromAddress), ymaps.geocode(toAddress)])
          .then(([fromRes, toRes]) => {
            const fromCoord = fromRes.geoObjects.get(0)?.geometry?.getCoordinates();
            const toCoord = toRes.geoObjects.get(0)?.geometry?.getCoordinates();
            if (!fromCoord || !toCoord) return;
            ymaps.route([fromCoord, toCoord])
              .then((route) => {
                const len = route.getLength();
                setDistanceKm(Math.round((len / 1000) * 10) / 10);
              })
              .catch(() => setDistanceKm(null));
          })
          .catch(() => setDistanceKm(null));
      });
    });
  }, [fromAddress, toAddress]);

  useEffect(() => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      setDistanceKm(null);
      return;
    }
    if (!hasYandexMapsKey()) return;
    const t = setTimeout(loadRoute, 500);
    return () => clearTimeout(t);
  }, [fromAddress, toAddress, loadRoute]);

  const fetchSuggest = (query: string, setSuggest: (s: string[]) => void) => {
    if (!query.trim()) {
      setSuggest([]);
      return;
    }
    clearTimeout(suggestTimeoutRef.current);
    suggestTimeoutRef.current = setTimeout(() => {
      loadYandexMaps().then(() => {
        const ymaps = window.ymaps as unknown as { suggest: (q: string) => Promise<{ value: string }[]> };
        if (!ymaps?.suggest) return;
        ymaps.suggest(query)
          .then((items) => setSuggest(items.map((i) => i.value)))
          .catch(() => setSuggest([]));
      });
    }, 200);
  };

  useEffect(() => {
    mainButton.setText('Заказать');
    mainButton.show();
    return () => {
      mainButton.hide();
    };
  }, []);

  useEffect(() => {
    if (orderSuccess) return;
    const enabled = Boolean(
      fromAddress.trim() &&
      toAddress.trim() &&
      totalPrice != null &&
      totalPrice > 0 &&
      name.trim() &&
      phone.trim()
    );
    mainButton.enable();
    mainButton.setParams({ isEnabled: enabled });
  }, [fromAddress, toAddress, totalPrice, name, phone, orderSuccess]);

  const handleMainButton = useCallback(() => {
    if (
      !fromAddress.trim() ||
      !toAddress.trim() ||
      totalPrice == null ||
      totalPrice <= 0 ||
      !name.trim() ||
      !phone.trim()
    ) {
      return;
    }
    mainButton.disable();
    mainButton.showLoader();
    setIsSubmitting(true);
    setTimeout(() => {
      mainButton.hideLoader();
      mainButton.enable();
      setIsSubmitting(false);
      setOrderSuccess(true);
      hapticFeedback.notificationOccurred('success');
      mainButton.hide();
    }, 800);
  }, [fromAddress, toAddress, totalPrice, name, phone]);

  handleMainButtonRef.current = handleMainButton;

  useEffect(() => {
    const off = mainButton.onClick(() => handleMainButtonRef.current());
    return () => off();
  }, []);

  if (orderSuccess) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center view-enter">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CircleDollarSign className="text-green-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Заказ принят!</h2>
        <p className="text-slate-400 mb-1">Стоимость: {totalPrice} ₽</p>
        <p className="text-slate-500 text-sm">С вами свяжутся в ближайшее время</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-8 view-enter">
      <h2 className="text-xl font-bold text-white mb-4">Калькулятор поездки</h2>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <label className="block text-sm text-slate-400 mb-1">Откуда</label>
          <input
            type="text"
            value={fromAddress}
            onChange={(e) => {
              setFromAddress(e.target.value);
              fetchSuggest(e.target.value, setFromSuggests);
              setFromSuggestOpen(true);
            }}
            onFocus={() => fromSuggests.length > 0 && setFromSuggestOpen(true)}
            onBlur={() => setTimeout(() => setFromSuggestOpen(false), 200)}
            placeholder="Адрес отправления"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white placeholder-slate-500 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          />
          {fromSuggestOpen && fromSuggests.length > 0 && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl max-h-40 overflow-auto">
              {fromSuggests.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/5 text-sm"
                    onMouseDown={() => {
                      setFromAddress(s);
                      setFromSuggests([]);
                      setFromSuggestOpen(false);
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm text-slate-400 mb-1">Куда</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => {
              setToAddress(e.target.value);
              fetchSuggest(e.target.value, setToSuggests);
              setToSuggestOpen(true);
            }}
            onFocus={() => toSuggests.length > 0 && setToSuggestOpen(true)}
            onBlur={() => setTimeout(() => setToSuggestOpen(false), 200)}
            placeholder="Адрес назначения"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white placeholder-slate-500 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          />
          {toSuggestOpen && toSuggests.length > 0 && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl max-h-40 overflow-auto">
              {toSuggests.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/5 text-sm"
                    onMouseDown={() => {
                      setToAddress(s);
                      setToSuggests([]);
                      setToSuggestOpen(false);
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-400 mb-2">Класс автомобиля</p>
        <div className="grid grid-cols-2 gap-2">
          {TARIFFS.map((t) => {
            const isSelected = selectedTariff === t.id;
            const Icon = t.Icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTariff(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-slate-300 hover:border-slate-500'
                }`}
              >
                <Icon size={20} />
                <div className="text-left">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs opacity-80">{t.pricePerKm} ₽/км</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {distanceKm != null && distanceKm > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-slate-400 text-sm">Расстояние: {distanceKm} км</p>
          <p className="text-2xl font-bold text-[var(--color-accent)] mt-1">
            {totalPrice} ₽
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Дата и время</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white placeholder-slate-500 focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Телефон</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white placeholder-slate-500 focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Пожелания к поездке"
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white placeholder-slate-500 focus:border-[var(--color-accent)] focus:outline-none resize-none"
          />
        </div>
      </div>

      {!hasYandexMapsKey() && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
          Для автоподсказок адресов и расчёта расстояния добавьте VITE_YANDEX_MAPS_API_KEY в .env
        </div>
      )}
    </div>
  );
}
