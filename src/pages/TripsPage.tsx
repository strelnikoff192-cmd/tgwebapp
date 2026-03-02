import { Clock, MapPin, Car } from 'lucide-react';
import { UserCard } from '@/components/UserCard';
import { useTripsStore } from '@/store/tripsStore';
import { useNavStore } from '@/store/navStore';

export function TripsPage() {
  const trips = useTripsStore((s) => s.trips);
  const setActiveTab = useNavStore((s) => s.setActiveTab);

  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-xl font-bold text-white mb-5">Поездки</h2>

      <div className="mb-5">
        <UserCard variant="compact" />
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: '#1a1a1a' }}
          >
            <Car size={28} style={{ color: '#525252' }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5">Нет поездок</h3>
          <p className="text-sm mb-5 max-w-[220px]" style={{ color: '#737373' }}>
            Закажите первую поездку — она появится здесь
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className="btn-primary py-2.5 px-5 rounded-xl text-sm"
          >
            Заказать
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {trips.map((trip) => (
            <div key={trip.id} className="card-glow p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex gap-2.5 min-w-0">
                  <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: '#d4a853' }} />
                  <span className="text-sm text-white truncate">{trip.from} → {trip.to}</span>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: '#d4a853' }}>{trip.price} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#737373' }}>
                  <Clock size={13} />
                  {trip.date}, {trip.time}
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(212, 168, 83, 0.1)', color: '#d4a853' }}
                >
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
