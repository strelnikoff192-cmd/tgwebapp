import { create } from 'zustand';

export type AdminSubTab = 'dashboard' | 'orders' | 'tariffs' | 'settings';

export type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface AdminOrder {
  id: string;
  from: string;
  to: string;
  price: number;
  clientName: string;
  clientPhone: string;
  carClass: string;
  status: OrderStatus;
  createdAt: string;
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
  botToken: string;
  webhookUrl: string;
}

const API_BASE = 'https://taxi-globus-api-bvcksite.amvera.io';

const today = new Date().toISOString().slice(0, 10);

const MOCK_ORDERS: AdminOrder[] = [
  { id: '1001', from: 'ул. Ленина 1', to: 'ул. Мира 25', price: 320, clientName: 'Иван Петров', clientPhone: '+7 (900) 123-45-67', carClass: 'econom', status: 'completed', createdAt: `${today}T09:15:00Z` },
  { id: '1002', from: 'пр. Победы 10', to: 'ТЦ Глобус', price: 450, clientName: 'Анна Сидорова', clientPhone: '+7 (900) 234-56-78', carClass: 'comfort', status: 'in_progress', createdAt: `${today}T10:30:00Z` },
  { id: '1003', from: 'Вокзал', to: 'Аэропорт', price: 1200, clientName: 'Олег Козлов', clientPhone: '+7 (900) 345-67-89', carClass: 'business', status: 'confirmed', createdAt: `${today}T11:00:00Z` },
  { id: '1004', from: 'ул. Гагарина 5', to: 'ул. Пушкина 12', price: 280, clientName: 'Мария Иванова', clientPhone: '+7 (900) 456-78-90', carClass: 'econom', status: 'new', createdAt: `${today}T12:20:00Z` },
  { id: '1005', from: 'ТЦ Мега', to: 'ул. Советская 3', price: 780, clientName: 'Дмитрий Волков', clientPhone: '+7 (900) 567-89-01', carClass: 'minivan', status: 'new', createdAt: `${today}T13:45:00Z` },
  { id: '1006', from: 'пр. Ленина 50', to: 'ул. Кирова 8', price: 350, clientName: 'Елена Смирнова', clientPhone: '+7 (900) 678-90-12', carClass: 'comfort', status: 'cancelled', createdAt: '2026-03-02T18:00:00Z' },
];

const MOCK_TARIFFS: TariffConfig[] = [
  { id: 'econom', name: 'Эконом', pricePerKm: 30, enabled: true },
  { id: 'comfort', name: 'Комфорт', pricePerKm: 35, enabled: true },
  { id: 'minivan', name: 'Минивэн', pricePerKm: 50, enabled: true },
  { id: 'business', name: 'Бизнес', pricePerKm: 55, enabled: true },
];

function computeStats(orders: AdminOrder[]): DashboardStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
  const completed = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + o.price, 0);
  return {
    totalOrders: orders.length,
    todayOrders,
    totalRevenue,
    avgOrderPrice: orders.length ? Math.round(orders.reduce((s, o) => s + o.price, 0) / orders.length) : 0,
  };
}

interface AdminState {
  activeSubTab: AdminSubTab;
  orders: AdminOrder[];
  tariffs: TariffConfig[];
  stats: DashboardStats;
  settings: AdminSettings;
  setSubTab: (tab: AdminSubTab) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  fetchTariffs: () => Promise<void>;
  updateTariff: (tariffId: string, pricePerKm: number) => void;
  toggleTariff: (tariffId: string) => void;
  fetchStats: () => void;
  updateSettings: (s: Partial<AdminSettings>) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeSubTab: 'dashboard',
  orders: MOCK_ORDERS,
  tariffs: MOCK_TARIFFS,
  stats: computeStats(MOCK_ORDERS),
  settings: { botToken: '', webhookUrl: `${API_BASE}/order` },

  setSubTab: (tab) => set({ activeSubTab: tab }),

  fetchOrders: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`);
      if (!res.ok) throw new Error('API error');
      const data: AdminOrder[] = await res.json();
      set({ orders: data, stats: computeStats(data) });
    } catch {
      // Use mock data already in state
    }
  },

  updateOrderStatus: (orderId, status) => {
    const orders = get().orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    set({ orders, stats: computeStats(orders) });
  },

  fetchTariffs: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/tariffs`);
      if (!res.ok) throw new Error('API error');
      const data: TariffConfig[] = await res.json();
      set({ tariffs: data });
    } catch {
      // Use mock data already in state
    }
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
}));
