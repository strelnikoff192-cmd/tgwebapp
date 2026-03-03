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
  Loader2,
  RefreshCw,
  AlertCircle,
  Gift,
} from 'lucide-react';
import { useReferralStore } from '@/store/referralStore';

const SUB_TABS: { id: AdminSubTab; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Обзор', Icon: LayoutDashboard },
  { id: 'orders', label: 'Заказы', Icon: ClipboardList },
  { id: 'tariffs', label: 'Тарифы', Icon: Sliders },
  { id: 'bonuses', label: 'Бонусы', Icon: Gift },
  { id: 'settings', label: 'Настройки', Icon: Settings },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новая',
  accepted: 'Принята',
  assigned: 'Назначена',
  in_progress: 'В пути',
  done: 'Выполнена',
  canceled: 'Отменена',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#d4a853',
  accepted: '#60a5fa',
  assigned: '#818cf8',
  in_progress: '#a78bfa',
  done: '#34d399',
  canceled: '#f87171',
};

const ALL_STATUSES: ('all' | OrderStatus)[] = ['all', 'new', 'accepted', 'assigned', 'in_progress', 'done', 'canceled'];
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Все',
  new: 'Новые',
  accepted: 'Принятые',
  assigned: 'Назнач.',
  in_progress: 'В пути',
  done: 'Выполн.',
  canceled: 'Отмена',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU') + ' \u20bd';
}

function statusColor(status: string): string {
  return STATUS_COLORS[status as OrderStatus] || '#737373';
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status as OrderStatus] || status;
}

/* ─── Dashboard ─── */
function DashboardTab() {
  const { stats, orders, tariffs, loading, error, fetchOrders } = useAdminStore();

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
      {error && (
        <div className="card-solid p-3 flex items-center gap-2 border-red-500/30">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span className="text-xs text-red-400">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-neutral-500" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-400">Статистика</span>
        <button type="button" onClick={() => fetchOrders()} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw size={16} className={`text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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
        {recentOrders.length === 0 && !loading && (
          <div className="text-sm text-neutral-500 py-2">Нет данных. Заполните логин/пароль в настройках.</div>
        )}
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
                  style={{ background: statusColor(o.status) + '20', color: statusColor(o.status) }}
                >
                  {statusLabel(o.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Order Card ─── */
function OrderCard({ o }: { o: import('@/store/adminStore').AdminOrder }) {
  const { updateOrderStatus, setCommission } = useAdminStore();
  const [commInput, setCommInput] = useState(o.commission != null ? String(o.commission) : '');
  const [saving, setSaving] = useState(false);

  async function handleSaveCommission() {
    const val = parseInt(commInput, 10);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    await setCommission(o.id, val);
    setSaving(false);
  }

  async function handleAccept() {
    const val = parseInt(commInput, 10);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    await setCommission(o.id, val);
    await updateOrderStatus(o.id, 'accepted');
    setSaving(false);
  }

  return (
    <div className="card-solid p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">{o.from} → {o.to}</div>
          <div className="text-xs text-neutral-400 mt-1">{o.clientName} · {o.clientPhone}</div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {formatDate(o.createdAt)} · {o.carClassLabel || o.carClass}
            {o.driverName && <span> · {o.driverName}</span>}
          </div>
          {o.comment && <div className="text-xs text-neutral-600 mt-0.5 italic">{o.comment}</div>}
        </div>
        <div className="text-right ml-3">
          <div className="text-sm font-bold text-white">{formatMoney(o.price)}</div>
          <span
            className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
            style={{ background: statusColor(o.status) + '20', color: statusColor(o.status) }}
          >
            {statusLabel(o.status)}
          </span>
        </div>
      </div>

      {/* Commission row */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-neutral-400 shrink-0">Комиссия:</span>
        {o.status === 'done' || o.status === 'canceled' ? (
          <span className="text-xs font-semibold text-white">
            {o.commission != null ? `${o.commission} \u20bd` : '—'}
          </span>
        ) : (
          <>
            <input
              type="number"
              value={commInput}
              onChange={(e) => setCommInput(e.target.value)}
              placeholder="0"
              className="input !py-1.5 !px-2.5 w-20 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCommission()}
            />
            <span className="text-xs text-neutral-500">{'\u20bd'}</span>
            <button
              type="button"
              onClick={handleSaveCommission}
              disabled={saving || !commInput || parseInt(commInput, 10) <= 0}
              className="btn-secondary px-2 py-1 text-[10px]"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            </button>
          </>
        )}
      </div>

      {o.status === 'new' && (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            disabled={saving || !commInput || parseInt(commInput, 10) <= 0}
            className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Принять
          </button>
          <button
            type="button"
            onClick={() => updateOrderStatus(o.id, 'canceled')}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            <XCircle size={14} />
            Отменить
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Orders ─── */
function OrdersTab() {
  const { orders, loading, fetchOrders } = useAdminStore();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="step-enter space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-neutral-400">{filtered.length} заказов</span>
        <button type="button" onClick={() => fetchOrders()} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw size={16} className={`text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-neutral-500" />
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center text-neutral-500 py-8 text-sm">Нет заказов</div>
      )}

      <div className="space-y-3">
        {filtered.map((o) => (
          <OrderCard key={o.id} o={o} />
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
                <span className="font-bold text-white">{t.pricePerKm} {'\u20bd'}/км</span>
                <Sliders size={14} className="text-neutral-500" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Bonuses ─── */
function BonusesTab() {
  const { bonusPoints, addBonusPoints } = useReferralStore();
  const [points, setPoints] = useState('');
  const [done, setDone] = useState(false);

  function handleAdd() {
    const val = parseInt(points, 10);
    if (isNaN(val) || val === 0) return;
    addBonusPoints(val);
    setPoints('');
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div className="step-enter space-y-4">
      <div className="card-solid p-4">
        <div className="text-xs text-neutral-400 mb-1">Текущий баланс клиента (это устройство)</div>
        <div className="text-2xl font-bold text-white">{bonusPoints.toLocaleString('ru-RU')} баллов</div>
      </div>

      <div className="card-solid p-4 space-y-3">
        <div className="text-sm font-semibold text-white">Начислить / списать баллы</div>
        <div className="text-xs text-neutral-500">Положительное число — начислить, отрицательное — списать</div>
        <div className="flex gap-2">
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="500"
            className="input !py-2.5 flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!points || parseInt(points, 10) === 0}
            className="btn-primary px-4 py-2.5 text-sm shrink-0"
          >
            {done ? <CheckCircle2 size={16} /> : 'Применить'}
          </button>
        </div>
        {done && <div className="text-xs text-green-400">Баллы обновлены</div>}
      </div>

      <div className="card-solid p-4 space-y-2">
        <div className="text-xs text-neutral-400">Информация</div>
        <div className="text-xs text-neutral-500">
          Бонусы хранятся локально на устройстве клиента в localStorage.
          Начисление через эту панель изменяет баланс текущего устройства.
          Для удалённого начисления конкретному пользователю необходима серверная база бонусов.
        </div>
      </div>
    </div>
  );
}

/* ─── Settings ─── */
function SettingsTab() {
  const { settings, updateSettings, fetchOrders } = useAdminStore();

  function handleSaveAndLoad() {
    fetchOrders();
  }

  return (
    <div className="step-enter space-y-4">
      <div className="card-solid p-4 space-y-4">
        <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wide">Авторизация API</div>
        <div>
          <label className="text-xs text-neutral-400 block mb-1.5">Логин (ADMIN_USER)</label>
          <input
            className="input text-sm"
            value={settings.adminUser}
            onChange={(e) => updateSettings({ adminUser: e.target.value })}
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400 block mb-1.5">Пароль (ADMIN_PASS)</label>
          <input
            className="input text-sm"
            value={settings.adminPass}
            onChange={(e) => updateSettings({ adminPass: e.target.value })}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>
        <button type="button" onClick={handleSaveAndLoad} className="btn-primary w-full py-3 text-sm">
          Сохранить и загрузить заказы
        </button>
      </div>

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
      </div>

      <div className="card-solid p-4 space-y-2">
        <div className="text-xs text-neutral-400">Информация</div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">API сервер</span>
          <span className="text-white text-xs">taxi-globus-api-bvcksite.amvera.io</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Эндпоинт заказов</span>
          <span className="text-white text-xs">/admin/api/orders</span>
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
    bonuses: BonusesTab,
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
