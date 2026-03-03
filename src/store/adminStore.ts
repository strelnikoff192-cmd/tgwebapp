import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminSubTab = 'dashboard' | 'orders' | 'tariffs' | 'settings';

export type OrderStatus = 'new' | 'accepted' | 'assigned' | 'in_progress' | 'done' | 'canceled';

export interface AdminOrder {
  id: string;
  from: string;
  to: string;
  price: number;
  clientName: string;
  clientPhone: string;
  carClass: string;
  carClassLabel: string;
  status: OrderStatus;
  stage: string;
  createdAt: string;
  tripDate: string;
  tripTime: string;
  comment: string;
  driverName: string | null;
  commission: number | null;
}

export interface TariffConfig {
  id: string;
  name: string;
  pricePerKm: number;
  enabled: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  avgOrderPrice: number;
}

interface AdminSettings {
  adminUser: string;
  adminPass: string;
  webhookUrl: string;
}

const API_BASE = 'https://taxi-globus-api-bvcksite.amvera.io';

const TARIFFS: TariffConfig[] = [
  { id: 'econom', name: 'Эконом', pricePerKm: 30, enabled: true },
  { id: 'comfort', name: 'Комфорт', pricePerKm: 35, enabled: true },
  { id: 'minivan', name: 'Минивэн', pricePerKm: 50, enabled: true },
  { id: 'business', name: 'Бизнес', pricePerKm: 55, enabled: true },
];

function computeStats(orders: AdminOrder[]): DashboardStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
  const doneOrders = orders.filter((o) => o.stage === 'done');
  const totalRevenue = doneOrders.reduce((s, o) => s + o.price, 0);
  return {
    totalOrders: orders.length,
    todayOrders,
    totalRevenue,
    avgOrderPrice: orders.length ? Math.round(orders.reduce((s, o) => s + o.price, 0) / orders.length) : 0,
  };
}

function authHeaders(user: string, pass: string): HeadersInit {
  return { Authorization: 'Basic ' + btoa(`${user}:${pass}`) };
}

interface ApiOrderItem {
  id: string;
  status: string;
  stage: string | null;
  from_addr: string;
  to_addr: string;
  total: number;
  name: string | null;
  phone: string;
  car_class: string;
  car_class_label: string;
  created_at: number;
  trip_date: string;
  trip_time: string;
  comment: string;
  driver_name: string | null;
  commission: number | null;
}

function mapOrder(r: ApiOrderItem): AdminOrder {
  return {
    id: r.id,
    from: r.from_addr,
    to: r.to_addr,
    price: r.total,
    clientName: r.name || '',
    clientPhone: r.phone,
    carClass: r.car_class,
    carClassLabel: r.car_class_label || r.car_class,
    status: (r.stage || r.status || 'new') as OrderStatus,
    stage: r.stage || r.status || 'new',
    createdAt: new Date(r.created_at).toISOString(),
    tripDate: r.trip_date,
    tripTime: r.trip_time,
    comment: r.comment || '',
    driverName: r.driver_name,
    commission: r.commission,
  };
}

interface AdminState {
  activeSubTab: AdminSubTab;
  orders: AdminOrder[];
  tariffs: TariffConfig[];
  stats: DashboardStats;
  settings: AdminSettings;
  loading: boolean;
  error: string | null;
  setSubTab: (tab: AdminSubTab) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  setCommission: (orderId: string, commission: number) => Promise<void>;
  fetchTariffs: () => Promise<void>;
  updateTariff: (tariffId: string, pricePerKm: number) => void;
  toggleTariff: (tariffId: string) => void;
  fetchStats: () => void;
  updateSettings: (s: Partial<AdminSettings>) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      activeSubTab: 'dashboard',
      orders: [],
      tariffs: TARIFFS,
      stats: computeStats([]),
      settings: { adminUser: '', adminPass: '', webhookUrl: `${API_BASE}/order` },
      loading: false,
      error: null,

      setSubTab: (tab) => set({ activeSubTab: tab }),

      fetchOrders: async () => {
        const { settings } = get();
        if (!settings.adminUser || !settings.adminPass) {
          set({ error: 'Укажите логин и пароль в настройках' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/admin/api/orders?period=all&limit=500`, {
            headers: authHeaders(settings.adminUser, settings.adminPass),
          });
          if (res.status === 401) {
            set({ loading: false, error: 'Неверный логин или пароль' });
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const orders = (json.items || []).map(mapOrder);
          set({ orders, stats: computeStats(orders), loading: false });
        } catch (e) {
          set({ loading: false, error: `Ошибка загрузки: ${(e as Error).message}` });
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const { settings } = get();
        try {
          await fetch(`${API_BASE}/admin/api/orders/${orderId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders(settings.adminUser, settings.adminPass) },
            body: JSON.stringify({ status }),
          });
        } catch {
          // Update locally even if API fails
        }
        const orders = get().orders.map((o) =>
          o.id === orderId ? { ...o, status: status as OrderStatus, stage: status } : o,
        );
        set({ orders, stats: computeStats(orders) });
      },

      setCommission: async (orderId, commission) => {
        const { settings } = get();
        try {
          const res = await fetch(`${API_BASE}/admin/api/orders/${orderId}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders(settings.adminUser, settings.adminPass) },
            body: JSON.stringify({ commission }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Ошибка' }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
        } catch {
          // Update locally even if API fails
        }
        const orders = get().orders.map((o) =>
          o.id === orderId ? { ...o, commission } : o,
        );
        set({ orders });
      },

      fetchTariffs: async () => {
        // Tariffs are hardcoded on backend (getRate function), no API endpoint
      },

      updateTariff: (tariffId, pricePerKm) => {
        set({ tariffs: get().tariffs.map((t) => (t.id === tariffId ? { ...t, pricePerKm } : t)) });
      },

      toggleTariff: (tariffId) => {
        set({ tariffs: get().tariffs.map((t) => (t.id === tariffId ? { ...t, enabled: !t.enabled } : t)) });
      },

      fetchStats: () => {
        set({ stats: computeStats(get().orders) });
      },

      updateSettings: (s) => {
        set({ settings: { ...get().settings, ...s } });
      },
    }),
    {
      name: 'admin-settings',
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
