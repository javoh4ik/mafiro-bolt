import React, { useState } from 'react';
import type { UserProfile } from '../types/game';
import { X, User, Check } from 'lucide-react';
import { getAvatarGradient, getInitials } from '../utils/avatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [name, setName] = useState(user.first_name);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const gradient = getAvatarGradient(name.trim() || user.first_name || user.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      first_name: name.trim() || 'Игрок',
      avatar_url: undefined
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1000);
  };

  const winRate = user.games_played > 0
    ? Math.round((user.games_won / user.games_played) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-[360px] rounded-3xl bg-[#0A0E17] border border-[#FF2A55]/40 shadow-2xl p-5 flex flex-col gap-4 text-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF2A55]" />
            <h3 className="font-serif font-bold text-base uppercase tracking-wider text-[#FF8FA5]">
              Профиль игрока
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gradient initials avatar preview */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center ring-2 ring-white/20"
            style={{
              background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              boxShadow: `0 0 16px ${gradient.glow}`,
            }}
          >
            <span className="text-xl font-bold text-white tracking-wide drop-shadow">
              {getInitials(name.trim() || user.first_name)}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono">
            Аватар строится из вашего имени автоматически
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#121A2A]/80 border border-white/5 text-center font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">Игр</span>
            <span className="text-base font-bold text-white">{user.games_played}</span>
          </div>
          <div className="flex flex-col border-x border-white/5">
            <span className="text-[10px] text-gray-400 uppercase">Побед</span>
            <span className="text-base font-bold text-emerald-400">{user.games_won}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">Винрейт</span>
            <span className="text-base font-bold text-amber-300">{winRate}%</span>
          </div>
        </div>

        {/* Name Edit Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif text-[#FF2A55] uppercase tracking-wider">
              Имя игрока
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1522] border border-white/10 focus:border-[#FF2A55] outline-none text-xs text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
            <span>ID игрока:</span>
            <span className="text-gray-300">{user.id}</span>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A55] to-[#A3122F] text-white font-serif font-black text-xs uppercase tracking-wider shadow-gold-glow active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            {savedToast ? <Check className="w-4 h-4 stroke-[3]" /> : null}
            <span>{savedToast ? 'Сохранено!' : 'Сохранить изменения'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
