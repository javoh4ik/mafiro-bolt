import React from 'react';
import { PublicPlayer, Role } from '../types/game';

interface PlayerSeatProps {
  player: PublicPlayer;
  isMe: boolean;
  isSelectedTarget: boolean;
  canTarget: boolean;
  onSelect: (seatNumber: number) => void;
  xPercent: number;
  yPercent: number;
  currentSpeechText?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isMe,
  isSelectedTarget,
  canTarget,
  onSelect,
  xPercent,
  yPercent,
  currentSpeechText
}) => {
  // Truncate nickname to 8 chars
  const displayName = player.first_name.length > 8 
    ? player.first_name.slice(0, 7) + '…' 
    : player.first_name;

  return (
    <div
      onClick={() => canTarget && onSelect(player.seat_number)}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-20 flex flex-col items-center transition-all duration-300 ${
        canTarget ? 'cursor-pointer active:scale-95' : ''
      }`}
    >
      {/* Floating Speech Bubble (3.8s) */}
      {player.is_speaking && currentSpeechText && (
        <div className="absolute -top-11 z-30 max-w-[140px] px-2.5 py-1 rounded-xl bg-[#0A0E17]/95 border border-[#FF2A55]/50 shadow-gold-glow backdrop-blur-md animate-float pointer-events-none">
          <p className="text-[10px] text-white font-medium truncate text-center leading-tight">
            {currentSpeechText}
          </p>
          {/* Bubble tail */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0A0E17] border-r border-b border-[#FF2A55]/50 rotate-45" />
        </div>
      )}

      {/* Main Avatar Container */}
      <div className="relative group">
        {/* High-contrast #Number Badge on top-left shoulder */}
        <div className={`absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shadow-md border ${
          isMe 
            ? 'bg-[#FF2A55] text-white border-[#FF8FA5]' 
            : 'bg-[#0F1522] text-[#E5E0D8] border-white/20'
        }`}>
          #{player.seat_number}
        </div>

        {/* Target indicator ring */}
        <div className={`w-12 h-12 rounded-full p-[2px] transition-all duration-300 ${
          isSelectedTarget
            ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#05070B] shadow-crimson-glow scale-105'
            : isMe
            ? 'ring-2 ring-[#FF2A55] shadow-gold-glow'
            : player.is_speaking
            ? 'ring-2 ring-[#FF2A55]/70 shadow-gold-glow animate-pulse-subtle'
            : 'border border-white/10'
        } ${!player.is_alive ? 'opacity-40 grayscale' : ''}`}>
          
          <img
            src={player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`}
            alt={player.first_name}
            className="w-full h-full rounded-full object-cover bg-[#0A0E17]"
          />
        </div>

        {/* Dead State Overlay */}
        {!player.is_alive && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <span className="text-sm">☠️</span>
          </div>
        )}

        {/* Votes Count Pill (Voting phase) */}
        {player.votes_received > 0 && (
          <div className="absolute -bottom-1 -right-1 z-20 px-1.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-200 font-mono text-[9px] font-bold shadow-sm">
            +{player.votes_received}
          </div>
        )}

        {/* Revealed Role Icon (if dead or game over) */}
        {player.role_icon && (
          <div className="absolute -top-1 -right-1 z-20 text-xs drop-shadow">
            {player.role_icon}
          </div>
        )}
      </div>

      {/* Truncated Nickname Pill */}
      <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border backdrop-blur-sm ${
        isMe 
          ? 'bg-[#FF2A55]/20 border-[#FF2A55]/60 text-[#FF8FA5]' 
          : 'bg-[#0A0E17]/80 border-white/10 text-[#C4CDD5]'
      }`}>
        {displayName}
      </div>
    </div>
  );
};
