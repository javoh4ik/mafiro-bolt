import React, { useState } from 'react';
import { X, Users, Zap, Shield, Check } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: {
    name: string;
    max_players: number;
    is_blitz: boolean;
    role_reveal_on_death: boolean;
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('Стол MAFIRO');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isBlitz, setIsBlitz] = useState(false);
  const [roleReveal, setRoleReveal] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: name.trim() || 'Стол MAFIRO',
      max_players: maxPlayers,
      is_blitz: isBlitz,
      role_reveal_on_death: roleReveal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-[400px] rounded-t-3xl sm:rounded-3xl bg-[#0D1119] border border-[#c5a059]/40 shadow-2xl p-5 flex flex-col gap-4 text-white">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎩</span>
            <h3 className="font-serif font-bold text-base tracking-wider uppercase text-[#FFF3B0]">
              Создать комнату
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Room Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif text-[#D4AF37] uppercase tracking-wider">
              Название стола
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/10 focus:border-[#D4AF37] outline-none text-xs text-white"
              maxLength={24}
              required
            />
          </div>

          {/* Max Players Slider (4 to 12) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Вместимость стола
              </span>
              <span className="font-mono font-bold text-sm text-white px-2.5 py-0.5 rounded bg-[#141A26] border border-[#D4AF37]/30 text-[#FFF3B0]">
                {maxPlayers} мест
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="1"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="w-full flex justify-between text-[10px] text-gray-400 font-mono">
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
              <span>12</span>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
            {/* Blitz Mode */}
            <div
              onClick={() => setIsBlitz(!isBlitz)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#121824] border border-white/5 hover:border-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${isBlitz ? 'text-amber-400' : 'text-gray-500'}`} />
                <div>
                  <div className="text-xs font-semibold text-white">Блиц-таймеры (25 сек)</div>
                  <div className="text-[10px] text-gray-400">Быстрое обсуждение и голосование</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                isBlitz ? 'bg-amber-500 border-amber-300 text-black' : 'border-white/20'
              }`}>
                {isBlitz && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Role Reveal on Death */}
            <div
              onClick={() => setRoleReveal(!roleReveal)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#121824] border border-white/5 hover:border-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${roleReveal ? 'text-emerald-400' : 'text-gray-500'}`} />
                <div>
                  <div className="text-xs font-semibold text-white">Вскрытие роли при казни</div>
                  <div className="text-[10px] text-gray-400">Показывать карту выбывшего игрока</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                roleReveal ? 'bg-emerald-500 border-emerald-300 text-black' : 'border-white/20'
              }`}>
                {roleReveal && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8012] text-black font-serif font-black text-xs uppercase tracking-widest shadow-gold-glow active:scale-95 transition-transform"
          >
            СОЗДАТЬ КОМНАТУ
          </button>
        </form>
      </div>
    </div>
  );
};
