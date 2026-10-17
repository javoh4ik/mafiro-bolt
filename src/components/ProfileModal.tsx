import React, { useState } from 'react';
import type { UserProfile } from '../types/game';
import { X, Trophy, User, Shield, Check } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const AVATAR_SEEDS = ['boss', 'detective', 'lady', 'gentleman', 'shadow', 'sheriff', 'don'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [name, setName] = useState(user.first_name);
  const [selectedSeed, setSelectedSeed] = useState(user.username || 'boss');
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoin();
    onUpdateUser({
      first_name: name.trim() || 'Игрок',
      username: selectedSeed,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedSeed}`
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
      <div className="w-full max-w-[360px] rounded-3xl bg-[#0D1119] border border-[#c5a059]/40 shadow-2xl p-5 flex flex-col gap-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base uppercase tracking-wider text-[#FFF3B0]">
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

        {/* Avatar & Pickers */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] p-1 bg-[#141A26] shadow-gold-glow">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedSeed}`}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover bg-[#090C12]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => setSelectedSeed(seed)}
                className={`w-8 h-8 rounded-full border p-0.5 transition-all ${
                  selectedSeed === seed
                    ? 'border-[#D4AF37] scale-110 shadow-gold-glow'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`}
                  alt={seed}
                  className="w-full h-full rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#141A26]/80 border border-white/5 text-center font-mono">
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
            <label className="text-xs font-serif text-[#D4AF37] uppercase tracking-wider">
              Имя игрока
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/10 focus:border-[#D4AF37] outline-none text-xs text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
            <span>ID игрока:</span>
            <span className="text-gray-300">{user.id}</span>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8012] text-black font-serif font-black text-xs uppercase tracking-wider shadow-gold-glow active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            {savedToast ? <Check className="w-4 h-4 stroke-[3]" /> : null}
            <span>{savedToast ? 'Сохранено!' : 'Сохранить изменения'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
