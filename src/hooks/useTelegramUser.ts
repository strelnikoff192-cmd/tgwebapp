import { initData, useSignal } from '@tma.js/sdk-react';

export function useTelegramUser() {
  const initDataState = useSignal(initData.state);
  const tgUser = initDataState?.user;
  const displayName = tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')
    : null;
  const username = tgUser?.username ? `@${tgUser.username}` : null;
  return { tgUser, displayName, username };
}
