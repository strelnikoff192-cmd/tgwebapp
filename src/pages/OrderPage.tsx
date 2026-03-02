import { useEffect, useRef, useState, useCallback, type ChangeEvent } from 'react';
import { mainButton, hapticFeedback, initData } from '@tma.js/sdk-react';
import {
  Car,
  Truck,
  Briefcase,
  CircleDollarSign,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

import { loadYandexMaps, hasYandexMapsKey } from '@/lib/yandexMaps';
import { useReferralStore } from '@/store/referralStore';
import { useTripsStore } from '@/store/tripsStore';

const STEPS = [
  { id: 1, title: 'Маршрут', short: 'Адреса' },
  { id: 2, title: 'Класс авто', short: 'Тариф' },
  { id: 3, title: 'Контакты', short: 'Детали' },
  { id: 4, title: 'Подтверждение', short: 'Готово' },
] as const;

const TARIFFS = [
  { id: 'econom', name: 'Эконом', pricePerKm: 30, Icon: Car, desc: 'Доступно' },
  { id: 'comfort', name: 'Комфорт', pricePerKm: 35, Icon: Car, desc: 'Удобно' },
  { id: 'minivan', name: 'Минивэн', pricePerKm: 50, Icon: Truck, desc: '6+ мест' },
  { id: 'business', name: 'Бизнес', pricePerKm: 55, Icon: Briefcase, desc: 'Премиум' },
] as const;

type TariffId = (typeof TARIFFS)[number]['id'];

const MAX_STEP = 4;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '');
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `+7 (${d}`;
  if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function rawPhone(formatted: string): string {
  return '+7' + formatted.replace(/\D/g, '').replace(/^7/, '').slice(0, 10);
}

interface YandexRoutePanel {
  routePanel: {
    state: { set: (s: Record<string, unknown>) => void };
    getRouteAsync: () => Promise<YandexMultiRoute>;
  };
}
interface YandexMultiRoute {
  model: { events: { add: (e: string, fn: () => void) => void } };
  getActiveRoute: () => { properties: { get: (k: string) => { value?: number } } } | null;
}

export function OrderPage() {
  const [step, setStep] = useState(1);
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
  const mapRef = useRef<HTMLDivElement>(null);
  const routePanelRef = useRef<YandexRoutePanel | null>(null);
  const mapInitedRef = useRef(false);
  const fromAddressRef = useRef(fromAddress);
  const toAddressRef = useRef(toAddress);
  fromAddressRef.current = fromAddress;
  toAddressRef.current = toAddress;

  const tariff = TARIFFS.find((t) => t.id === selectedTariff)!;
  const referralDiscount = useReferralStore((s) => s.getCurrentDiscount());
  const firstRideDiscount = useReferralStore((s) => s.getFirstRideDiscount());
  const totalDiscount = Math.max(referralDiscount, firstRideDiscount);

  const rawPrice =
    distanceKm != null && distanceKm > 0 ? Math.round(distanceKm * tariff.pricePerKm) : null;
  const totalPrice = rawPrice != null && totalDiscount > 0
    ? Math.round(rawPrice * (1 - totalDiscount / 100))
    : rawPrice;

  const addTrip = useTripsStore((s) => s.addTrip);

  useEffect(() => {
    const user = initData.state()?.user;
    if (!user) return;
    setName((prev) =>
      prev.trim() ? prev : [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    );
  }, []);

  const canNextStep1 = fromAddress.trim().length > 0 && toAddress.trim().length > 0;
  const canNextStep2 = true;
  const canNextStep3 = name.trim().length > 0 && phone.trim().length > 0;
  const canSubmit =
    canNextStep1 && canNextStep2 && canNextStep3 &&
    fromAddress.trim() && toAddress.trim() && totalPrice != null && totalPrice > 0 && name.trim() && phone.trim();

  useEffect(() => {
    if (!hasYandexMapsKey() || !mapRef.current || mapInitedRef.current) return;
    mapInitedRef.current = true;
    loadYandexMaps().then(() => {
      const ymaps = window.ymaps as unknown as {
        ready: (fn: () => void) => void;
        Map: new (el: HTMLElement, opts: { center: number[]; zoom: number; controls: string[] }) => {
          controls: { get: (name: string) => unknown };
        };
      };
      ymaps.ready(() => {
        if (!mapRef.current) return;
        const map = new ymaps.Map(mapRef.current, {
          center: [55.76, 37.64],
          zoom: 5,
          controls: ['routePanelControl', 'zoomControl'],
        });
        const routePanel = map.controls.get('routePanelControl') as YandexRoutePanel;
        routePanelRef.current = routePanel;
        routePanel.routePanel.state.set({ type: 'auto', fromEnabled: true, toEnabled: true });
        routePanel.routePanel.getRouteAsync().then((multiRoute: YandexMultiRoute) => {
          multiRoute.model.events.add('requestsuccess', () => {
            const active = multiRoute.getActiveRoute();
            if (!active) return;
            const dist = active.properties.get('distance') as { value?: number } | undefined;
            const meters = dist?.value;
            if (typeof meters === 'number' && Number.isFinite(meters)) {
              setDistanceKm(Math.round((meters / 1000) * 10) / 10);
            }
          });
        });
        const fromInit = fromAddressRef.current.trim();
        const toInit = toAddressRef.current.trim();
        if (fromInit && toInit) routePanel.routePanel.state.set({ type: 'auto', from: fromInit, to: toInit });
      });
    });
    return () => { mapInitedRef.current = false; };
  }, []);

  useEffect(() => {
    const from = fromAddress.trim();
    const to = toAddress.trim();
    if (!from || !to) { setDistanceKm(null); return; }
    const panel = routePanelRef.current;
    if (!panel) return;
    const t = setTimeout(() => { panel.routePanel.state.set({ type: 'auto', from, to }); }, 300);
    return () => clearTimeout(t);
  }, [fromAddress, toAddress]);

  const fetchSuggest = (query: string, setSuggest: (s: string[]) => void) => {
    if (!query.trim()) { setSuggest([]); return; }
    clearTimeout(suggestTimeoutRef.current);
    suggestTimeoutRef.current = setTimeout(() => {
      loadYandexMaps().then(() => {
        const ymaps = window.ymaps as unknown as { suggest: (q: string) => Promise<{ value: string }[]> };
        if (!ymaps?.suggest) return;
        ymaps.suggest(query).then((items) => setSuggest(items.map((i) => i.value))).catch(() => setSuggest([]));
      });
    }, 200);
  };

  const goNext = useCallback(() => {
    hapticFeedback.selectionChanged();
    if (step < MAX_STEP) setStep((s) => s + 1);
  }, [step]);

  const goBack = useCallback(() => {
    hapticFeedback.selectionChanged();
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    if (step < MAX_STEP) { mainButton.hide(); } else { mainButton.setText('Заказать'); mainButton.show(); }
    return () => mainButton.hide();
  }, [step]);

  useEffect(() => {
    if (orderSuccess) return;
    mainButton.enable();
    mainButton.setParams({ isEnabled: step === MAX_STEP && Boolean(canSubmit) });
  }, [step, canSubmit, orderSuccess]);

  const handleMainButton = useCallback(async () => {
    if (!canSubmit) return;
    mainButton.disable();
    mainButton.showLoader();
    setIsSubmitting(true);

    const now = new Date();
    const tripDateVal = dateTime ? dateTime.split('T')[0] : now.toISOString().split('T')[0];
    const tripTimeVal = dateTime ? dateTime.split('T')[1] || '00:00' : now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const orderData = {
      from: fromAddress,
      to: toAddress,
      carClass: tariff.id,
      price: totalPrice,
      km: distanceKm ?? 0,
      name,
      phone: rawPhone(phone),
      comment,
      tripDate: tripDateVal,
      tripTime: tripTimeVal,
    };

    try {
      await fetch('https://taxi-globus-api-bvcksite.amvera.io/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } catch {
      // Сохраняем заказ локально даже при ошибке сети
    }

    mainButton.hideLoader();
    mainButton.enable();
    setIsSubmitting(false);
    setOrderSuccess(true);
    hapticFeedback.notificationOccurred('success');
    mainButton.hide();

    addTrip({
      from: fromAddress,
      to: toAddress,
      date: now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      price: totalPrice!,
      tariff: tariff.name,
      distanceKm: distanceKm ?? 0,
      status: 'completed',
    });
  }, [canSubmit, fromAddress, toAddress, totalPrice, totalDiscount, tariff.name, tariff.pricePerKm, distanceKm, addTrip, name, phone, comment, dateTime]);

  handleMainButtonRef.current = handleMainButton;

  useEffect(() => {
    const off = mainButton.onClick(() => handleMainButtonRef.current());
    return () => off();
  }, []);

  if (orderSuccess) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center view-enter">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(52, 211, 153, 0.1)' }}
        >
          <CircleDollarSign size={32} style={{ color: '#34d399' }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-1.5">Заказ принят!</h2>
        <p className="font-bold text-2xl mb-1" style={{ color: '#d4a853' }}>{totalPrice} ₽</p>
        {totalDiscount > 0 && rawPrice && (
          <p className="text-sm line-through mb-1" style={{ color: '#525252' }}>{rawPrice} ₽</p>
        )}
        <p className="text-sm" style={{ color: '#737373' }}>С вами свяжутся в ближайшее время</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 view-enter">
      {hasYandexMapsKey() && (
        <div className="fixed overflow-hidden" style={{ left: -9999, top: 0, width: 400, height: 400, zIndex: -1 }} aria-hidden="true">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      )}

      {/* Progress bar with glow */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => s.id <= step && setStep(s.id)}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: s.id <= step ? '#d4a853' : 'rgba(255,255,255,0.06)',
              opacity: s.id <= step ? 1 : 0.4,
            }}
            aria-label={s.title}
          />
        ))}
      </div>
      <p className="text-sm font-semibold mb-5" style={{ color: '#d4a853' }}>{STEPS[step - 1].title}</p>

      {/* Discount banner */}
      {totalDiscount > 0 && step <= 2 && (
        <div className="card-glow p-3 mb-4 flex items-center gap-3">
          <Sparkles size={16} style={{ color: '#34d399' }} />
          <span className="text-sm font-medium" style={{ color: '#34d399' }}>
            Скидка {totalDiscount}% {firstRideDiscount > referralDiscount ? '— первая поездка' : '— реферальная'}
          </span>
        </div>
      )}

      {/* Step 1: Маршрут */}
      {step === 1 && (
        <div className="step-enter space-y-4">
          <div className="relative">
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Откуда</label>
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => { setFromAddress(e.target.value); fetchSuggest(e.target.value, setFromSuggests); setFromSuggestOpen(true); }}
              onFocus={() => fromSuggests.length > 0 && setFromSuggestOpen(true)}
              onBlur={() => setTimeout(() => setFromSuggestOpen(false), 200)}
              placeholder="Адрес отправления"
              className="input"
            />
            {fromSuggestOpen && fromSuggests.length > 0 && (
              <ul className="card-solid absolute z-10 top-full left-0 right-0 mt-2 py-2 shadow-xl max-h-40 overflow-auto">
                {fromSuggests.map((s) => (
                  <li key={s}>
                    <button type="button" className="w-full px-4 py-2.5 text-left text-white hover:bg-white/5 text-sm transition-colors" onMouseDown={() => { setFromAddress(s); setFromSuggests([]); setFromSuggestOpen(false); }}>{s}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Куда</label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => { setToAddress(e.target.value); fetchSuggest(e.target.value, setToSuggests); setToSuggestOpen(true); }}
              onFocus={() => toSuggests.length > 0 && setToSuggestOpen(true)}
              onBlur={() => setTimeout(() => setToSuggestOpen(false), 200)}
              placeholder="Адрес назначения"
              className="input"
            />
            {toSuggestOpen && toSuggests.length > 0 && (
              <ul className="card-solid absolute z-10 top-full left-0 right-0 mt-2 py-2 shadow-xl max-h-40 overflow-auto">
                {toSuggests.map((s) => (
                  <li key={s}>
                    <button type="button" className="w-full px-4 py-2.5 text-left text-white hover:bg-white/5 text-sm transition-colors" onMouseDown={() => { setToAddress(s); setToSuggests([]); setToSuggestOpen(false); }}>{s}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!hasYandexMapsKey() && (
            <p className="text-xs" style={{ color: '#525252' }}>Добавьте VITE_YANDEX_MAPS_API_KEY для подсказок</p>
          )}
        </div>
      )}

      {/* Step 2: Класс авто + цена */}
      {step === 2 && (
        <div className="step-enter space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {TARIFFS.map((t) => {
              const isSelected = selectedTariff === t.id;
              const Icon = t.Icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { hapticFeedback.selectionChanged(); setSelectedTariff(t.id); }}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95"
                  style={{
                    background: isSelected ? 'rgba(212, 168, 83, 0.06)' : '#1a1a1a',
                    border: `1px solid ${isSelected ? 'rgba(212, 168, 83, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-all"
                    style={{
                      background: isSelected ? 'rgba(212, 168, 83, 0.12)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Icon size={22} style={{ color: isSelected ? '#d4a853' : '#525252' }} />
                  </span>
                  <div className="text-center">
                    <div className="font-semibold text-sm" style={{ color: isSelected ? '#d4a853' : '#e5e5e5' }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#737373' }}>{t.pricePerKm} ₽/км</div>
                  </div>
                </button>
              );
            })}
          </div>
          {distanceKm != null && distanceKm > 0 ? (
            <div className="card-glow p-5">
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: '#737373' }}>≈ {distanceKm} км × {tariff.pricePerKm} ₽</span>
                <div className="text-right">
                  <span className="text-2xl font-bold" style={{ color: '#d4a853' }}>{totalPrice} ₽</span>
                  {totalDiscount > 0 && rawPrice && (
                    <span className="block text-xs line-through" style={{ color: '#525252' }}>{rawPrice} ₽</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Укажите адреса на предыдущем шаге для расчёта</p>
          )}
        </div>
      )}

      {/* Step 3: Контакты */}
      {step === 3 && (
        <div className="step-enter space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Когда</label>
            <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Имя</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" className="input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Телефон</label>
            <input type="tel" value={phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(formatPhone(e.target.value))} placeholder="(999) 123-45-67" className="input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: '#737373' }}>Комментарий</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Пожелания к поездке" rows={2} className="input resize-none" />
          </div>
        </div>
      )}

      {/* Step 4: Подтверждение */}
      {step === 4 && (
        <div className="step-enter">
          <div className="card-glow space-y-4 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Маршрут</span>
              <span className="text-white text-right max-w-[60%] truncate">{fromAddress} → {toAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Класс</span>
              <span className="text-white font-semibold">{tariff.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Стоимость</span>
              <div className="text-right">
                <span className="font-bold" style={{ color: '#d4a853' }}>{totalPrice} ₽</span>
                {totalDiscount > 0 && rawPrice && (
                  <span className="ml-2 text-xs line-through" style={{ color: '#525252' }}>{rawPrice} ₽</span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Имя</span>
              <span className="text-white">{name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Телефон</span>
              <span className="text-white">{phone}</span>
            </div>
            {comment.trim() && (
              <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-slate-400">Комментарий</span>
                <span className="text-white text-right max-w-[60%]">{comment}</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-4 text-center">Нажмите «Заказать» внизу экрана</p>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-20 left-0 right-0 px-4 flex items-center justify-between gap-3 safe-area-pb">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="btn-secondary flex items-center gap-1.5 py-3.5 px-4 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={20} />
          Назад
        </button>
        {step < MAX_STEP && (
          <button
            type="button"
            onClick={goNext}
            disabled={(step === 1 && !canNextStep1) || (step === 2 && !canNextStep2) || (step === 3 && !canNextStep3)}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-3.5 px-4"
          >
            Далее
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
