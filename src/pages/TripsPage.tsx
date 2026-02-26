import { Clock, MapPin } from 'lucide-react';

const MOCK_TRIPS = [
  { id: '1', from: 'ул. Тверская, 1', to: 'Шереметьево', date: '25 фев 2025', time: '14:30', price: 1250, status: 'completed' },
  { id: '2', from: 'Кремль', to: 'ВДНХ', date: '24 фев 2025', time: '10:00', price: 890, status: 'completed' },
];

export function TripsPage() {
  return (
    <div className="p-4 pb-8 view-enter">
      <h2 className="text-xl font-bold text-white mb-4">Поездки</h2>
      <div className="space-y-3">
        {MOCK_TRIPS.map((trip) => (
          <div
            key={trip.id}
            className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex gap-2 text-slate-300 text-sm">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>{trip.from} → {trip.to}</span>
              </div>
              <span className="text-[var(--color-accent)] font-semibold shrink-0">{trip.price} ₽</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Clock size={12} />
              {trip.date}, {trip.time}
            </div>
          </div>
        ))}
      </div>
      {MOCK_TRIPS.length === 0 && (
        <p className="text-slate-500 text-center py-8">Пока нет поездок</p>
      )}
    </div>
  );
}
