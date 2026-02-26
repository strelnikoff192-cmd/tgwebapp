import { useNavStore } from '@/store/navStore';
import { BottomNav } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { OrderPage } from '@/pages/OrderPage';
import { TripsPage } from '@/pages/TripsPage';
import { LoyaltyPage } from '@/pages/LoyaltyPage';
import { ProfilePage } from '@/pages/ProfilePage';

const PAGES = {
  home: HomePage,
  order: OrderPage,
  trips: TripsPage,
  loyalty: LoyaltyPage,
  profile: ProfilePage,
} as const;

export function Layout() {
  const activeTab = useNavStore((s) => s.activeTab);
  const Page = PAGES[activeTab];

  return (
    <div className="flex flex-col h-full min-h-screen bg-[var(--color-bg)]">
      <main className="flex-1 overflow-auto pb-20 view-enter">
        <Page />
      </main>
      <BottomNav />
    </div>
  );
}
