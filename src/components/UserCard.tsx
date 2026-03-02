import { User as UserIcon } from 'lucide-react';
import { useNavStore } from '@/store/navStore';
import { useUserStore } from '@/store/userStore';
import { hapticFeedback } from '@tma.js/sdk-react';

type UserCardVariant = 'compact' | 'full';

interface UserCardProps {
  variant?: UserCardVariant;
  linkToProfile?: boolean;
}

export function UserCard({ variant = 'compact', linkToProfile = true }: UserCardProps) {
  const { tgUser, displayName, username, isAuthorized } = useUserStore();
  const setActiveTab = useNavStore((s) => s.setActiveTab);

  const handleClick = () => {
    if (linkToProfile) {
      hapticFeedback.selectionChanged();
      setActiveTab('profile');
    }
  };

  const isCompact = variant === 'compact';
  const size = isCompact ? 'h-11 w-11' : 'h-14 w-14';
  const padding = isCompact ? 'p-3.5' : 'p-5';

  const wrapClass = `card-glow flex w-full items-center gap-3.5 ${padding} text-left transition-all ${linkToProfile ? 'active:scale-[0.98] cursor-pointer' : ''}`;

  const content = (
    <>
      {tgUser?.photo_url ? (
        <img src={tgUser.photo_url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
      ) : (
        <div
          className={`flex ${size} shrink-0 items-center justify-center rounded-full font-bold ${isCompact ? 'text-base' : 'text-lg'}`}
          style={{ background: '#d4a853', color: '#0a0a0a' }}
        >
          {displayName && displayName !== 'Гость' ? displayName.charAt(0).toUpperCase() : <UserIcon size={isCompact ? 20 : 26} />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-white truncate ${isCompact ? 'text-[15px]' : 'text-lg'}`}>
          {displayName}
        </p>
        <p className={`truncate ${isCompact ? 'text-xs mt-0.5' : 'text-sm mt-0.5'}`} style={{ color: isAuthorized ? '#a3a3a3' : '#525252' }}>
          {username || (isAuthorized ? 'Telegram' : 'Откройте через бота')}
        </p>
      </div>
      {isAuthorized && (
        <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
      )}
    </>
  );

  return linkToProfile ? (
    <button type="button" onClick={handleClick} className={wrapClass}>{content}</button>
  ) : (
    <div className={wrapClass}>{content}</div>
  );
}
