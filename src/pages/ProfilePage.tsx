import { User, Phone, Mail, LogOut } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="p-4 pb-8 view-enter">
      <h2 className="text-xl font-bold text-white mb-4">Профиль</h2>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-6">
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
          <User size={28} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">Гость</p>
          <p className="text-sm text-slate-400">Войдите через Telegram</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Phone size={20} className="text-slate-400" />
          <span className="text-slate-300">+7 (***) ***-**-**</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Mail size={20} className="text-slate-400" />
          <span className="text-slate-300">email@example.com</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3 rounded-xl border border-[var(--color-border)] text-slate-400 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  );
}
