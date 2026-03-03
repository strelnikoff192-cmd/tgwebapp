import { create } from 'zustand';
import { initData } from '@tma.js/sdk-react';

const BOT_USERNAME = 'GlobusTaxiBot';

interface ReferralTier {
  friends: number;
  discount: number;
  label: string;
}

export const MAX_DISCOUNT = 7;

export const REFERRAL_TIERS: ReferralTier[] = [
  { friends: 1, discount: 3, label: 'Первый друг' },
  { friends: 3, discount: 5, label: '3 друга' },
  { friends: 5, discount: 7, label: '5 друзей' },
];

interface ReferralState {
  referralCode: string | null;
  referredBy: string | null;
  invitedFriends: number;
  bonusPoints: number;
  isFirstRide: boolean;
  init: () => void;
  getReferralLink: () => string;
  getCurrentDiscount: () => number;
  getFirstRideDiscount: () => number;
  addInvitedFriend: () => void;
  addBonusPoints: (points: number) => void;
}

const LS_KEY = 'globus_referral';

function loadFromStorage(): Partial<ReferralState> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveToStorage(state: { invitedFriends: number; bonusPoints: number; isFirstRide: boolean; referredBy: string | null }) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export const useReferralStore = create<ReferralState>((set, get) => {
  const saved = loadFromStorage();
  return {
    referralCode: null,
    referredBy: saved.referredBy as string | null ?? null,
    invitedFriends: (saved.invitedFriends as number) ?? 0,
    bonusPoints: (saved.bonusPoints as number) ?? 0,
    isFirstRide: (saved.isFirstRide as boolean) ?? true,

    init: () => {
      try {
        const state = initData.state();
        const user = state?.user;
        if (user) {
          const code = `ref_${user.id}`;
          set({ referralCode: code });

          // Parse startParam for referral
          const startParam = state?.start_param;
          if (startParam?.startsWith('ref_') && startParam !== code) {
            const stored = loadFromStorage();
            if (!stored.referredBy) {
              set({ referredBy: startParam });
              saveToStorage({ ...get(), referredBy: startParam });
            }
          }
        }
      } catch { /* Not in TG */ }
    },

    getReferralLink: () => {
      const code = get().referralCode;
      return code ? `https://t.me/${BOT_USERNAME}?start=${code}` : '';
    },

    getCurrentDiscount: () => {
      const { invitedFriends } = get();
      let discount = 0;
      for (const tier of REFERRAL_TIERS) {
        if (invitedFriends >= tier.friends) discount = tier.discount;
      }
      return Math.min(discount, MAX_DISCOUNT);
    },

    getFirstRideDiscount: () => {
      return get().referredBy && get().isFirstRide ? MAX_DISCOUNT : 0;
    },

    addInvitedFriend: () => {
      set((s) => {
        const newState = {
          invitedFriends: s.invitedFriends + 1,
          bonusPoints: s.bonusPoints + 500,
          isFirstRide: s.isFirstRide,
          referredBy: s.referredBy,
        };
        saveToStorage(newState);
        return newState;
      });
    },

    addBonusPoints: (points) => {
      set((s) => {
        const newState = {
          invitedFriends: s.invitedFriends,
          bonusPoints: s.bonusPoints + points,
          isFirstRide: s.isFirstRide,
          referredBy: s.referredBy,
        };
        saveToStorage(newState);
        return newState;
      });
    },
  };
});
