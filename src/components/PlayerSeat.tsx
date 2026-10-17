import React from 'react';
import { PublicPlayer } from '../types/game';
import { getAvatarGradient, getInitials } from '../utils/avatar';

interface PlayerSeatProps {
  player?: PublicPlayer;
  seatNumber: number;
  isMe: boolean;
  isSelectedTarget: boolean;
  canTarget: boolean;
  canReseat: boolean;
  onSelect: (seatNumber: number) => void;
  onSeatClick: (seatNumber: number) => void;
  xPercent: number;
  yPercent: number;
  currentSpeechText?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  seatNumber,
  isMe,
  isSelectedTarget,
  canTarget,
  canReseat,
  onSelect,
  onSeatClick,
  xPercent,
  yPercent,
  currentSpeechText
}) => {
  const gradient = getAvatarGradient(player?.first_name || player?.id || `seat_${seatNumber}`);

  const displayName = player
    ? (player.first_name.length > 8
        ? player.first_name.slice(0, 7) + '…'
        : player.first_name)
    : 'Свободно';

  const handleClick = () => {
    if (player) {
      if (canTarget) onSelect(seatNumber);
    } else if (canReseat) {
      onSeatClick(seatNumber);
    }
  };

  const clickable = player ? canTarget : canReseat;

  // ============ EMPTY SEAT ============
  if (!player) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!canReseat}
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: 'translate(-50%, -50%)',
        }}
        className={`absolute z-10 flex flex-col items-center justify-center gap-1 w-16 h-[72px] rounded-2xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-200 ${
          canReseat
            ? 'cursor-pointer hover:bg-white/15 hover:border-white/30 hover:scale-105 hover:shadow-[0_0_12px_rgba(34,197,94,0.4)]'
            : 'cursor-default opacity-70'
        }`}
      >
        <span className={`text-lg leading-none font-bold ${canReseat ? 'text-white/50' : 'text-white/25'}`}>+</span>
        <span className="text-[9px] font-mono text-white/40">#{seatNumber}</span>
      </button>
    );
  }

  // ============ OCCUPIED SEAT ============
  return (
    <div
      onClick={handleClick}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-20 flex flex-col items-center w-[72px] rounded-2xl transition-all duration-200 ${
        clickable ? 'cursor-pointer active:scale-95' : ''
      }`}
    >
      {/* Floating Speech Bubble */}
      {player.is_speaking && currentSpeechText && (
        <div className="absolute -top-10 z-30 max-w-[150px] px-2.5 py-1 rounded-xl bg-[#0A0E17]/95 border border-white/15 shadow-lg backdrop-blur-md animate-float pointer-events-none">
          <p className="text-[10px] text-white/90 font-medium truncate text-center leading-tight">
            {currentSpeechText}
          </p>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0A0E17] rotate-45" />
        </div>
      )}

      {/* Seat Card: avatar + name */}
      <div
        className={`relative w-full flex flex-col items-center gap-1 py-2 rounded-2xl bg-white/[0.08] backdrop-blur-md border transition-all duration-200 ${
          isSelectedTarget
            ? 'border-red-500/80 shadow-[0_0_16px_rgba(220,38,38,0.5)] scale-105'
            : isMe
            ? 'border-amber-400/70 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
            : 'border-white/15'
        }`}
      >
        {/* Seat number badge */}
        <div className="absolute -top-1.5 -left-1.5 z-20 px-1.5 py-0.5 rounded-full bg-black/40 border border-white/10 font-mono text-[9px] font-bold text-white/60">
          #{seatNumber}
        </div>

        {/* Votes pill */}
        {player.votes_received > 0 && (
          <div className="absolute -bottom-1 -right-1 z-20 px-1.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-200 font-mono text-[9px] font-bold">
            +{player.votes_received}
          </div>
        )}

        {/* Revealed role icon */}
        {player.role_icon && (
          <div className="absolute -top-2 -right-2 z-20 text-xs drop-shadow">
            {player.role_icon}
          </div>
        )}

        {/* Gradient initials avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-white/20 ${!player.is_alive ? 'opacity-40 grayscale' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            boxShadow: `0 0 12px ${gradient.glow}`,
          }}
        >
          <span className="text-sm font-bold text-white tracking-wide drop-shadow">
            {getInitials(player.first_name)}
          </span>
          {!player.is_alive && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <span className="text-sm">☠️</span>
            </div>
          )}
        </div>

        {/* Name */}
        <span className={`text-[10px] font-medium max-w-full truncate px-1 ${isMe ? 'text-amber-300' : 'text-white/90'}`}>
          {displayName}
        </span>
      </div>
    </div>
  );
};
