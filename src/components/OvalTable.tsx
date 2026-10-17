import React, { useMemo, useState } from 'react';
import type { PublicPlayer, Phase, TargetVector } from '../types/game';
import { PlayerSeat } from './PlayerSeat';
import { TargetLines } from './TargetLines';
import { Moon, Sun, Scale, Skull, Clock, Users, Share2, Play, Check } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface OvalTableProps {
  players: PublicPlayer[];
  mySeatNumber?: number;
  maxPlayers?: number;
  roomName?: string;
  roomId?: string;
  phase: Phase;
  phaseTimeLeft: number;
  dayNumber: number;
  activeTargets: TargetVector[];
  selectedTargetSeat?: number;
  canTarget: boolean;
  onSelectTarget: (seatNumber: number) => void;
  recentMessages?: Array<{ sender_seat: number; text: string }>;
  onStartGame?: () => void;
  isHost?: boolean;
}

export const OvalTable: React.FC<OvalTableProps> = ({
  players,
  mySeatNumber = 1,
  maxPlayers = 8,
  roomName = 'Стол MAFIRO',
  roomId = '',
  phase,
  phaseTimeLeft,
  dayNumber,
  activeTargets,
  selectedTargetSeat,
  canTarget,
  onSelectTarget,
  recentMessages = [],
  onStartGame,
  isHost = true
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const totalSeats = Math.max(maxPlayers || 8, players.length, 4);

  // Compute Trigonometric Polar Coordinates around Ellipse (rx = 41%, ry = 40%)
  // Center is at (50%, 50%)
  // Current player perspective: anchor mySeat at bottom (90 deg / π/2 rad)
  // Remaining seats distributed evenly: angle = 90 + (relative_index * 360 / N)
  const { seatCoordinates, playerMap } = useMemo(() => {
    const coords: Record<number, { x: number; y: number }> = {};
    const map: Record<number, PublicPlayer> = {};

    players.forEach((p) => {
      map[p.seat_number] = p;
    });

    const rx = 41; // Horizontal radius %
    const ry = 40; // Vertical radius %

    for (let seat = 1; seat <= totalSeats; seat++) {
      const relIdx = (seat - mySeatNumber + totalSeats) % totalSeats;
      const angleDeg = 90 + (relIdx * 360) / totalSeats;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = 50 + rx * Math.cos(angleRad);
      const y = 50 + ry * Math.sin(angleRad);

      coords[seat] = {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      };
    }

    return { seatCoordinates: coords, playerMap: map };
  }, [players, mySeatNumber, totalSeats]);

  // Felt background class according to phase
  const feltBgClass = useMemo(() => {
    switch (phase) {
      case 'night':
        return 'felt-surface-night border-[#1e293b] shadow-[inset_0_0_80px_rgba(3,7,18,0.9)]';
      case 'day':
        return 'felt-surface-day border-[#133F2E] shadow-[inset_0_0_80px_rgba(2,20,10,0.9)]';
      case 'vote':
      case 'last_word':
        return 'felt-surface-vote border-[#4A1521] shadow-[inset_0_0_80px_rgba(30,3,8,0.9)]';
      default:
        return 'felt-surface-day border-[#1b3a30] shadow-[inset_0_0_70px_rgba(2,20,10,0.85)]';
    }
  }, [phase]);

  // Phase Title and Icon
  const phaseInfo = useMemo(() => {
    switch (phase) {
      case 'night':
        return {
          title: `НОЧЬ #${dayNumber}`,
          desc: 'Синдикат на охоте',
          icon: <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />,
          color: 'text-indigo-300',
          badgeBorder: 'border-indigo-500/40'
        };
      case 'day':
        return {
          title: `ДЕНЬ #${dayNumber}`,
          desc: 'Город обсуждает улики',
          icon: <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />,
          color: 'text-amber-300',
          badgeBorder: 'border-amber-500/40'
        };
      case 'vote':
        return {
          title: 'СУД ПРИСЯЖНЫХ',
          desc: 'Выберите подозреваемого',
          icon: <Scale className="w-4 h-4 text-rose-500 animate-bounce" />,
          color: 'text-rose-400',
          badgeBorder: 'border-rose-500/50'
        };
      case 'last_word':
        return {
          title: 'ПОСЛЕДНЕЕ СЛОВО',
          desc: 'Эшафот',
          icon: <Skull className="w-4 h-4 text-red-500" />,
          color: 'text-red-400',
          badgeBorder: 'border-red-500/60'
        };
      case 'game_over':
        return {
          title: 'ФИНАЛ ИГРЫ',
          desc: 'Итоги противостояния',
          icon: <Scale className="w-4 h-4 text-[#FF2A55]" />,
          color: 'text-[#FF2A55]',
          badgeBorder: 'border-[#FF2A55]/50'
        };
      default:
        return {
          title: roomName,
          desc: `Ожидание игроков: ${players.length} / ${totalSeats}`,
          icon: <Users className="w-4 h-4 text-[#FF2A55]" />,
          color: 'text-[#FF2A55]',
          badgeBorder: 'border-[#FF2A55]/30'
        };
    }
  }, [phase, dayNumber, roomName, players.length, totalSeats]);

  // Speech bubble map
  const speechMap = useMemo(() => {
    const map: Record<number, string> = {};
    recentMessages.forEach((m) => {
      map[m.sender_seat] = m.text;
    });
    return map;
  }, [recentMessages]);

  const handleShareLink = () => {
    sounds.playCoin();
    const shareUrl = roomId ? `${window.location.origin}?startapp=${roomId}` : window.location.href;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Присоединяйся к игре в MAFIRO!')}`);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-[54dvh] min-h-[390px] max-h-[500px] flex items-center justify-center p-2 select-none">
      {/* Outer Modern Obsidian Rim with crimson ambient edge lighting */}
      <div className="relative w-full h-full rounded-[140px] p-2.5 bg-gradient-to-b from-[#0D1119] to-[#05070B] border-2 border-[#FF2A55]/30 shadow-[0_0_45px_rgba(255,42,85,0.18),0_18px_40px_rgba(0,0,0,0.7)] flex items-center justify-center">
        
        {/* Table Felt Surface */}
        <div className={`relative w-full h-full rounded-[125px] transition-colors duration-700 border flex items-center justify-center overflow-visible ${feltBgClass}`}>
          
          {/* Decorative Inner Ring */}
          <div className="absolute inset-4 rounded-[105px] border border-white/[0.08] pointer-events-none" />
          {/* Crimson ambient edge glow inside the felt */}
          <div className="absolute inset-0 rounded-[125px] shadow-[inset_0_0_60px_rgba(255,42,85,0.12)] pointer-events-none" />

          {/* Table Center Info & Minimalist Lobby Controls */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 py-2 text-center">
            
            {/* Phase Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#05070B]/90 border backdrop-blur-md shadow-md mb-1 ${phaseInfo.badgeBorder}`}>
              {phaseInfo.icon}
              <span className={`font-serif tracking-widest text-[11px] font-bold uppercase ${phaseInfo.color}`}>
                {phaseInfo.title}
              </span>
            </div>

            {/* JetBrains Mono Tabular Countdown Timer during Match */}
            {phase !== 'lobby' && phase !== 'game_over' && (
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-black/60 border border-white/10 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-[#FF2A55]" />
                <span className="font-mono text-base font-bold tabular-nums text-white tracking-wider">
                  00:{phaseTimeLeft < 10 ? `0${phaseTimeLeft}` : phaseTimeLeft}
                </span>
              </div>
            )}

            {/* Subtitle / Seated Status */}
            <span className="text-[11px] text-[#A0AEC0] tracking-wide text-center font-sans font-medium">
              {phaseInfo.desc}
            </span>

            {/* LOBBY PHASE: INVITE FRIENDS & START GAME */}
            {phase === 'lobby' && (
              <div className="flex flex-col items-center gap-2 mt-3 pointer-events-auto">
                <span className="text-[10px] text-gray-400 font-mono">
                  (минимум 4 игрока для старта)
                </span>

                <div className="flex items-center gap-2">
                  {/* Invite Friends Button */}
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FF2A55]" />}
                    <span>{copiedLink ? 'Ссылка скопирована' : 'Пригласить'}</span>
                  </button>

                  {/* Start Match Button */}
                  <button
                    type="button"
                    onClick={onStartGame}
                    disabled={players.length < 4}
                    className={`px-4 py-1.5 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow active:scale-95 transition-all ${
                      players.length >= 4
                        ? 'bg-gradient-to-r from-[#FF2A55] to-[#A3122F] text-white cursor-pointer'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>НАЧАТЬ ИГРУ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SVG Target Vector Lasers */}
          <TargetLines targets={activeTargets} seatCoordinates={seatCoordinates} />

          {/* ALL SEATS (Occupied Players + Crisp Glassmorphic Empty Slots) */}
          {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seatNum) => {
            const coord = seatCoordinates[seatNum] || { x: 50, y: 50 };
            const player = playerMap[seatNum];

            if (player) {
              return (
                <PlayerSeat
                  key={`occupied-seat-${seatNum}`}
                  player={player}
                  isMe={player.seat_number === mySeatNumber}
                  isSelectedTarget={selectedTargetSeat === player.seat_number}
                  canTarget={canTarget && player.is_alive && player.seat_number !== mySeatNumber}
                  onSelect={onSelectTarget}
                  xPercent={coord.x}
                  yPercent={coord.y}
                  currentSpeechText={speechMap[player.seat_number]}
                />
              );
            }

            // Crisp Glassmorphic Empty Seat Slot
            return (
              <div
                key={`empty-seat-${seatNum}`}
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-10 flex flex-col items-center select-none"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/15 flex items-center justify-center backdrop-blur-sm shadow-md transition-all hover:bg-white/[0.08]">
                  <span className="font-mono font-bold text-xs text-white/70">
                    #{seatNum}
                  </span>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-white/40 bg-white/[0.03] border border-white/5">
                  Свободно
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
