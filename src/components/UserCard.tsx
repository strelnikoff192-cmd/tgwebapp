import { User as UserIcon } from 'lucide-react';
import { useNavStore } from '@/store/navStore';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { hapticFeedback } from '@tma.js/sdk-react';

type UserCardVariant = 'compact' | 'full';

interface UserCardProps {
  variant?: UserCardVariant;
  /** При клике перейти в профиль */
  linkToProfile?: boolean;
}

/**
 * Блок пользователя (аватар + имя). Используется в Профиле, Лояльности, Поездках.
 */
export function UserCard({ variant = 'compact', linkToProfile = true }: UserCardProps) {
  const { tgUser, displayName, username } = useTelegramUser();
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

  const className = `card-solid flex w-full items-center gap-4 ${padding} text-left transition-colors ${linkToProfile ? 'hover:bg-white/5 active:opacity-90 cursor-pointer' : ''}`;
  const content = (
    <>
      {tgUser?.photo_url ? (
        <img
          src={tgUser.photo_url}
          alt=""
          className={`${size} shrink-0 rounded-2xl object-cover`}
        />
      ) : (
        <div
          className={`flex ${size} shrink-0 items-center justify-center rounded-2xl text-white font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          }}
        >
          {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon size={isCompact ? 24 : 32} />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-white truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
          {displayName || 'Гость'}
        </p>
        <p className={`text-slate-400 truncate ${isCompact ? 'text-xs mt-0.5' : 'text-sm mt-0.5'}`}>
          {username || (tgUser ? 'Telegram' : 'Откройте через бота в Telegram')}
        </p>
      </div>
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
