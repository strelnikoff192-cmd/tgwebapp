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
  const size = isCompact ? 'h-12 w-12' : 'h-16 w-16';
  const padding = isCompact ? 'p-3' : 'p-5';

  const className = `card-glow flex w-full items-center gap-4 ${padding} text-left transition-all ${linkToProfile ? 'hover:border-[var(--color-accent)]/30 active:scale-[0.98] cursor-pointer' : ''}`;
  const content = (
    <>
      {tgUser?.photo_url ? (
        <img
          src={tgUser.photo_url}
          alt=""
          className={`${size} shrink-0 rounded-2xl object-cover ring-2 ring-[var(--color-accent)]/20`}
        />
      ) : (
        <div
          className={`flex ${size} shrink-0 items-center justify-center rounded-2xl text-white font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}
          style={{
            background: 'linear-gradient(135deg, #00e5ff 0%, #7c3aed 100%)',
            boxShadow: '0 4px 20px rgba(0, 229, 255, 0.3)',
          }}
        >
          {displayName && displayName !== 'Гость' ? displayName.charAt(0).toUpperCase() : <UserIcon size={isCompact ? 24 : 32} />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-bold text-white truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
          {displayName}
        </p>
        <p className={`truncate ${isCompact ? 'text-xs mt-0.5' : 'text-sm mt-0.5'}`} style={{ color: isAuthorized ? '#00e5ff' : '#64748b' }}>
          {username || (isAuthorized ? 'Telegram' : 'Откройте через бота')}
        </p>
      </div>
      {isAuthorized && (
        <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
      )}
    </>
  );

  return linkToProfile ? (
    <button type="button" onClick={handleClick} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
