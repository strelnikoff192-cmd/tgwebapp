import { Phone, Mail, LogOut } from 'lucide-react';
import { UserCard } from '@/components/UserCard';

export function ProfilePage() {
  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Профиль</h2>

      <div className="mb-6">
        <UserCard variant="full" linkToProfile={false} />
      </div>

      <div className="space-y-3 mb-6">
        <div className="card-solid flex items-center gap-4 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
            <Phone size={20} />
          </span>
          <span className="text-slate-200">+7 (***) ***-**-**</span>
        </div>
        <div className="card-solid flex items-center gap-4 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
            <Mail size={20} />
          </span>
          <span className="text-slate-200">email@example.com</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-secondary w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  );
}
