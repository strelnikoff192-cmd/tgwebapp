import { User, Phone, Mail, LogOut } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="p-5 pb-10 view-enter">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Профиль</h2>

      <div className="card-solid flex items-center gap-4 p-5 mb-6">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          }}
        >
          <User size={32} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-lg">Гость</p>
          <p className="text-sm text-slate-400 mt-0.5">Войдите через Telegram</p>
        </div>
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
