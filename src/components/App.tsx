import { AppRoot } from '@telegram-apps/telegram-ui';
import { useLaunchParams } from '@tma.js/sdk-react';
import { Layout } from '@/components/Layout';

export function App() {
  const lp = useLaunchParams();
  const platform = ['macos', 'ios'].includes(lp.tgWebAppPlatform ?? '') ? 'ios' : 'base';

  return (
    <AppRoot appearance="dark" platform={platform}>
      <Layout />
    </AppRoot>
  );
}
