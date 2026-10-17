import React, { useEffect } from 'react';
import { PublicPlayer } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, ArrowLeft, RefreshCw, Star, DollarSign } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface GameOverModalProps {
  winner?: string;
  winnerTitle?: string;
  players: PublicPlayer[];
  mySeatNumber?: number;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  winnerTitle,
  players,
  mySeatNumber,
  onReturnToLobby
}) => {
  useEffect(() => {
    // Fire festive luxury confetti
    try {
      sounds.playCoin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2A55', '#FF8FA5', '#DC2626', '#10B981']
      });
    } catch {}
  }, []);

  const isSyndicateWin = winner === 'MAFIA';
  const isTownWin = winner === 'TOWN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className={`w-full max-w-[390px] rounded-3xl p-5 border-2 shadow-luxury flex flex-col items-center text-white ${
        isSyndicateWin
          ? 'bg-gradient-to-b from-[#1C090E] via-[#0E0608] to-[#05070B] border-red-500/60 shadow-crimson-glow'
          : isTownWin
          ? 'bg-gradient-to-b from-[#091D13] via-[#05110A] to-[#05070B] border-emerald-500/60 shadow-gold-glow'
          : 'bg-gradient-to-b from-[#2A0812] via-[#170409] to-[#05070B] border-[#FF2A55]/60 shadow-gold-glow'
      }`}>
        
        {/* Victory Icon & Title */}
        <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-3xl shadow-inner mb-2 animate-bounce">
          {isSyndicateWin ? '👑' : isTownWin ? '⭐' : '🔪'}
        </div>

        <h2 className="font-serif text-xl font-black tracking-widest uppercase text-center text-[#FF8FA5]">
          {isSyndicateWin ? 'ПОБЕДА СИНДИКАТА' : isTownWin ? 'ПОБЕДА ГОРОДА' : 'ПОБЕДА МАНЬЯКА'}
        </h2>
        
        <p className="text-xs text-gray-300 text-center mt-1 px-2 font-sans font-medium">
          {winnerTitle || 'Противостояние подошло к концу.'}
        </p>

        {/* All Players Roles Reveal */}
        <div className="w-full my-4 flex flex-col">
          <span className="font-serif text-[11px] font-bold text-[#FF2A55] uppercase tracking-wider mb-1.5 px-1">
            Карты всех игроков:
          </span>
          <div className="space-y-1 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
            {players.map((p) => (
              <div
                key={`reveal-${p.seat_number}`}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono ${
                  p.seat_number === mySeatNumber
                    ? 'bg-[#FF2A55]/15 border-[#FF2A55]/50'
                    : 'bg-[#0F1522]/60 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#FF2A55]">#{p.seat_number}</span>
                  <span className="text-gray-200">{p.first_name}</span>
                  {p.seat_number === mySeatNumber && (
                    <span className="text-[9px] text-[#FF8FA5] bg-[#FF2A55]/30 px-1 rounded">ВЫ</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{p.role_icon || '❓'}</span>
                  <span className="text-[11px] font-serif font-bold text-gray-300">
                    {p.role_title || 'Скрыто'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Button */}
        <button
          type="button"
          onClick={onReturnToLobby}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2A55] to-[#A3122F] text-white font-serif font-black text-xs uppercase tracking-widest shadow-gold-glow active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" /> В главное меню
        </button>
      </div>
    </div>
  );
};
