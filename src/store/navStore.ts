import { create } from 'zustand';

export type TabId = 'home' | 'order' | 'trips' | 'loyalty' | 'profile';

interface NavState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
