import { useUserStore } from '@/store/userStore';

export function useTelegramUser() {
  const { tgUser, displayName, username } = useUserStore();
  return { tgUser, displayName, username };
}
