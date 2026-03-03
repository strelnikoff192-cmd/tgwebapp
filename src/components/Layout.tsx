import { useEffect } from 'react';
import { useNavStore } from '@/store/navStore';
import { useUserStore } from '@/store/userStore';
import { useReferralStore } from '@/store/referralStore';
import { BottomNav } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { OrderPage } from '@/pages/OrderPage';
import { TripsPage } from '@/pages/TripsPage';
import { LoyaltyPage } from '@/pages/LoyaltyPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';

const PAGES = {
  home: HomePage,
  order: OrderPage,
  trips: TripsPage,
  loyalty: LoyaltyPage,
  profile: ProfilePage,
  admin: AdminPage,
} as const;

export function Layout() {
  const activeTab = useNavStore((s) => s.activeTab);
  const Page = PAGES[activeTab];
  const initUser = useUserStore((s) => s.init);
  const initReferral = useReferralStore((s) => s.init);

  useEffect(() => {
    initUser();
    initReferral();
  }, [initUser, initReferral]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-cosmos">
      <main className="flex-1 overflow-auto pb-24 view-enter" key={activeTab}>
        <Page />
      </main>
      <BottomNav />
    </div>
  );
}
