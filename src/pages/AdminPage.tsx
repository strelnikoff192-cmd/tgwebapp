import { useEffect, useState } from 'react';
import {
  useAdminStore,
  type AdminSubTab,
  type OrderStatus,
} from '@/store/adminStore';
import {
  LayoutDashboard,
  ClipboardList,
  Sliders,
  Settings,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  BarChart3,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';

const SUB_TABS: { id: AdminSubTab; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Обзор', Icon: LayoutDashboard },
  { id: 'orders', label: 'Заказы', Icon: ClipboardList },
  { id: 'tariffs', label: 'Тарифы', Icon: Sliders },
  { id: 'settings', label: 'Настройки', Icon: Settings },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  confirmed: 'Подтв.',
  in_progress: 'В пути',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#d4a853',
  confirmed: '#60a5fa',
  in_progress: '#a78bfa',
  completed: '#34d399',
  cancelled: '#f87171',
};

const ALL_STATUSES: ('all' | OrderStatus)[] = ['all', 'new', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Все',
  new: 'Новые',
  confirmed: 'Подтв.',
  in_progress: 'В пути',
  completed: 'Выполн.',
  cancelled: 'Отмена',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU') + ' \u20bd';
}

/* ─── Dashboard ─── */
function DashboardTab() {
  const { stats, orders, tariffs } = useAdminStore();

  const popularTariff = (() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.carClass] = (counts[o.carClass] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top) return '—';
    const t = tariffs.find((t) => t.id === top[0]);
    return t ? t.name : top[0];
  })();

  const statCards = [
    { label: 'Всего заказов', value: stats.totalOrders, Icon: ShoppingCart, color: '#d4a853' },
    { label: 'Сегодня', value: stats.todayOrders, Icon: TrendingUp, color: '#60a5fa' },
    { label: 'Выручка', value: formatMoney(stats.totalRevenue), Icon: DollarSign, color: '#34d399' },
    { label: 'Средний чек', value: formatMoney(stats.avgOrderPrice), Icon: BarChart3, color: '#a78bfa' },
  ];

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="step-enter space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((c) => (
          <div key={c.label} className="card-solid p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.Icon size={18} style={{ color: c.color }} />
              <span className="text-xs text-neutral-400">{c.label}</span>
            </div>
            <div className="text-xl font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card-solid p-4">
        <span className="text-xs text-neutral-400">Популярный тариф</span>
        <div className="text-lg font-bold text-white mt-1">{popularTariff}</div>
      </div>

      <div className="card-solid p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Последние заказы</span>
        </div>
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{o.from} → {o.to}</div>
                <div className="text-xs text-neutral-500">{formatDate(o.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm font-semibold text-white">{formatMoney(o.price)}</span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}
                >
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Orders ─── */
function OrdersTab() {
  const { orders, updateOrderStatus } = useAdminStore();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  function nextStatus(current: OrderStatus): OrderStatus | null {
    if (current === 'new') return 'confirmed';
    if (current === 'confirmed') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    return null;
  }

  const nextLabel: Record<string, string> = {
    new: 'Подтвердить',
    confirmed: 'В пути',
    in_progress: 'Выполнен',
  };

  return (
    <div className="step-enter space-y-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              filter === s
                ? { background: '#d4a853', color: '#000' }
                : { background: 'rgba(255,255,255,0.06)', color: '#a3a3a3' }
            }
          >
            {STATUS_FILTER_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-neutral-500 py-8 text-sm">Нет заказов</div>
      )}

      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="card-solid p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{o.from} → {o.to}</div>
                <div className="text-xs text-neutral-400 mt-1">{o.clientName} · {o.clientPhone}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{formatDate(o.createdAt)} · {o.carClass}</div>
              </div>
              <div className="text-right ml-3">
                <div className="text-sm font-bold text-white">{formatMoney(o.price)}</div>
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
                  style={{ background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}
                >
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>

            {(o.status === 'new' || o.status === 'confirmed' || o.status === 'in_progress') && (
              <div className="flex gap-2 pt-1">
                {nextStatus(o.status) && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(o.id, nextStatus(o.status)!)}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    <ChevronRight size={14} />
                    {nextLabel[o.status]}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateOrderStatus(o.id, 'cancelled')}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <XCircle size={14} />
                  Отменить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tariffs ─── */
function TariffsTab() {
  const { tariffs, updateTariff, toggleTariff } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(id: string, current: number) {
    setEditing(id);
    setEditValue(String(current));
  }

  function saveEdit(id: string) {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val > 0) updateTariff(id, val);
    setEditing(null);
  }

  return (
    <div className="step-enter space-y-3">
      {tariffs.map((t) => (
        <div key={t.id} className="card-solid p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-neutral-400 mt-0.5">ID: {t.id}</div>
            </div>
            <button
              type="button"
              onClick={() => toggleTariff(t.id)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: t.enabled ? '#34d399' : 'rgba(255,255,255,0.1)' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: t.enabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {editing === t.id ? (
              <>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input w-24 !py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(t.id)}
                  autoFocus
                />
                <button type="button" onClick={() => saveEdit(t.id)} className="btn-primary px-3 py-2 text-xs">
                  <CheckCircle2 size={14} />
                  Сохр.
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => startEdit(t.id, t.pricePerKm)}
                className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-white">{t.pricePerKm} \u20bd/км</span>
                <Sliders size={14} className="text-neutral-500" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Settings ─── */
function SettingsTab() {
  const { settings, updateSettings } = useAdminStore();

  return (
    <div className="step-enter space-y-4">
      <div className="card-solid p-4 space-y-4">
        <div>
          <label className="text-xs text-neutral-400 block mb-1.5">Webhook URL</label>
          <input
            className="input text-sm"
            value={settings.webhookUrl}
            onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400 block mb-1.5">Bot Token</label>
          <input
            className="input text-sm"
            value={settings.botToken}
            onChange={(e) => updateSettings({ botToken: e.target.value })}
            placeholder="123456:ABC-DEF..."
            type="password"
          />
        </div>
      </div>

      <div className="card-solid p-4 space-y-2">
        <div className="text-xs text-neutral-400">Информация</div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">API сервер</span>
          <span className="text-white">taxi-globus-api-bvcksite.amvera.io</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Версия</span>
          <span className="text-white">1.0.0</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main AdminPage ─── */
export function AdminPage() {
  const { activeSubTab, setSubTab, fetchOrders, fetchTariffs } = useAdminStore();

  useEffect(() => {
    fetchOrders();
    fetchTariffs();
  }, [fetchOrders, fetchTariffs]);

  const TAB_CONTENT: Record<AdminSubTab, () => JSX.Element> = {
    dashboard: DashboardTab,
    orders: OrdersTab,
    tariffs: TariffsTab,
    settings: SettingsTab,
  };

  const Content = TAB_CONTENT[activeSubTab];

  return (
    <div className="px-4 pt-4">
      <h1 className="text-lg font-bold text-white mb-4">Админ-панель</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {SUB_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
            style={
              activeSubTab === id
                ? { background: '#d4a853', color: '#000' }
                : { background: 'rgba(255,255,255,0.06)', color: '#a3a3a3' }
            }
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <Content />
    </div>
  );
}
