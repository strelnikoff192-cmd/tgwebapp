import { Clock, MapPin, Car } from 'lucide-react';
import { UserCard } from '@/components/UserCard';
import { useTripsStore } from '@/store/tripsStore';
import { useNavStore } from '@/store/navStore';

export function TripsPage() {
  const trips = useTripsStore((s) => s.trips);
  const setActiveTab = useNavStore((s) => s.setActiveTab);

  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-black text-white mb-6 tracking-tight text-glow">Поездки</h2>

      <div className="mb-5">
        <UserCard variant="compact" />
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 animate-float"
            style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.1)' }}
          >
            <Car size={36} style={{ color: '#00e5ff' }} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Пока нет поездок</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-[240px]">
            Закажите первую поездку и она появится здесь
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className="btn-primary py-3 px-6 rounded-xl text-sm"
          >
            Заказать поездку
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div key={trip.id} className="card-glow p-4 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex gap-2 text-slate-200 text-sm min-w-0">
                  <MapPin size={18} className="shrink-0 mt-0.5" style={{ color: '#00e5ff' }} />
                  <span className="truncate">{trip.from} → {trip.to}</span>
                </div>
                <span className="font-black shrink-0" style={{ color: '#00e5ff' }}>{trip.price} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                  <Clock size={14} />
                  {trip.date}, {trip.time}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}>
                  {trip.tariff}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
