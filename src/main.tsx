// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './components/Root.tsx';
import { EnvUnsupported } from './components/EnvUnsupported.tsx';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { init } from './init.ts';

import './index.css';
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug =
    (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  });

  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
} catch {
  root.render(<EnvUnsupported />);
}
