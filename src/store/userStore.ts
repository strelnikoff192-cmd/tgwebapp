import { create } from 'zustand';
import { initData } from '@tma.js/sdk-react';

interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface UserState {
  tgUser: TgUser | null;
  isAuthorized: boolean;
  displayName: string;
  username: string | null;
  init: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  tgUser: null,
  isAuthorized: false,
  displayName: 'Гость',
  username: null,
  init: () => {
    try {
      const state = initData.state();
      const user = state?.user;
      if (user) {
        const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        set({
          tgUser: user as TgUser,
          isAuthorized: true,
          displayName,
          username: user.username ? `@${user.username}` : null,
        });
      }
    } catch {
      // Not in Telegram context
    }
  },
}));
