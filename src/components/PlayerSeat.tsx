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
  compact: boolean;
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
  compact,
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
  const avatarSize = compact ? 'w-10 h-10' : 'w-12 h-12';
  const initialsSize = compact ? 'text-xs' : 'text-sm';
  const cardWidth = compact ? 'w-[64px]' : 'w-[72px]';

  // ============ EMPTY SEAT: sleek glass ring ============
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
        className={`absolute z-10 flex items-center justify-center rounded-full border border-dashed backdrop-blur-sm transition-all duration-200 ${avatarSize} ${
          canReseat
            ? 'border-white/25 bg-white/[0.06] cursor-pointer hover:border-[#FF2A55]/60 hover:bg-white/[0.12] hover:scale-110 hover:shadow-[0_0_16px_rgba(255,42,85,0.35)]'
            : 'border-white/15 bg-white/[0.03] cursor-default opacity-60'
        }`}
      >
        <span className={`font-mono font-bold ${compact ? 'text-[10px]' : 'text-xs'} ${canReseat ? 'text-white/50' : 'text-white/30'}`}>
          +{seatNumber}
        </span>
      </button>
    );
  }

  // ============ OCCUPIED SEAT: cyber-noir glass card ============
  return (
    <div
      onClick={handleClick}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-20 flex flex-col items-center ${cardWidth} transition-all duration-200 ${
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

      {/* Glass card */}
      <div
        className={`relative w-full flex flex-col items-center gap-1 py-2 rounded-2xl bg-white/[0.07] backdrop-blur-md border transition-all duration-200 ${
          isSelectedTarget
            ? 'border-[#FF2A55] shadow-[0_0_18px_rgba(255,42,85,0.5)] scale-105'
            : isMe
            ? 'border-[#FF2A55]/70 shadow-[0_0_14px_rgba(255,42,85,0.35)]'
            : 'border-white/15'
        }`}
      >
        {/* Seat number badge */}
        <div className="absolute -top-1.5 -left-1.5 z-20 px-1.5 py-0.5 rounded-full bg-black/50 border border-white/10 font-mono text-[9px] font-bold text-white/60">
          #{seatNumber}
        </div>

        {/* Votes pill */}
        {player.votes_received > 0 && (
          <div className="absolute -bottom-1 -right-1 z-20 px-1.5 py-0.5 rounded-full bg-[#3A0A14] border border-[#FF2A55]/70 text-[#FF8FA5] font-mono text-[9px] font-bold shadow-[0_0_10px_rgba(255,42,85,0.4)]">
            +{player.votes_received}
          </div>
        )}

        {/* Revealed role icon */}
        {player.role_icon && (
          <div className="absolute -top-2 -right-2 z-20 text-xs drop-shadow">
            {player.role_icon}
          </div>
        )}

        {/* Cyber-Noir Avatar: dark glass circle + gradient initial + glowing status ring */}
        <div
          className={`relative ${avatarSize} rounded-full p-[2px] transition-shadow duration-200`}
          style={{
            background: 'rgba(255,255,255,0.08)',
            boxShadow: player.is_alive && (player.is_speaking || isMe)
              ? `0 0 14px ${gradient.glow}, inset 0 0 0 1px rgba(255,255,255,0.12)`
              : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
          }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${!player.is_alive ? 'opacity-40 grayscale' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${gradient.from}33, ${gradient.to}66), #0A0E17`,
            }}
          >
            <span
              className={`${initialsSize} font-black tracking-wide`}
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 6px ${gradient.glow})`,
              }}
            >
              {getInitials(player.first_name)}
            </span>
          </div>

          {/* Glowing status dot */}
          {player.is_alive && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0A0E17] ${player.is_speaking ? 'animate-pulse' : ''}`}
              style={{ background: gradient.from, boxShadow: `0 0 6px ${gradient.glow}` }}
            />
          )}

          {/* Dead overlay */}
          {!player.is_alive && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <span className="text-sm">☠️</span>
            </div>
          )}
        </div>

        {/* Name */}
        <span className={`text-[10px] font-medium max-w-full truncate px-1 ${isMe ? 'text-[#FF8FA5]' : 'text-white/90'}`}>
          {displayName}
        </span>
      </div>
    </div>
  );
};
