import { Clock, MapPin } from 'lucide-react';

const MOCK_TRIPS = [
  { id: '1', from: 'ул. Тверская, 1', to: 'Шереметьево', date: '25 фев 2025', time: '14:30', price: 1250, status: 'completed' },
  { id: '2', from: 'Кремль', to: 'ВДНХ', date: '24 фев 2025', time: '10:00', price: 890, status: 'completed' },
];

export function TripsPage() {
  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Поездки</h2>
      <div className="space-y-4">
        {MOCK_TRIPS.map((trip) => (
          <div key={trip.id} className="card-solid p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex gap-2 text-slate-200 text-sm min-w-0">
                <MapPin size={18} className="shrink-0 mt-0.5 text-slate-400" />
                <span className="truncate">{trip.from} → {trip.to}</span>
              </div>
              <span className="text-[var(--color-accent)] font-bold shrink-0">{trip.price} ₽</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Clock size={14} />
              {trip.date}, {trip.time}
            </div>
          </div>
        ))}
      </div>
      {MOCK_TRIPS.length === 0 && (
        <p className="text-slate-500 text-center py-12">Пока нет поездок</p>
      )}
    </div>
  );
}
