import React, { useMemo, useState, useCallback } from 'react';
import type { PublicPlayer, Phase, TargetVector } from '../types/game';
import { PlayerSeat } from './PlayerSeat';
import { TargetLines } from './TargetLines';
import { Moon, Sun, Scale, Skull, Clock, Users, Link2, Play, Check } from 'lucide-react';

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
  onReseat: (seatNumber: number) => void;
  recentMessages?: Array<{ sender_seat: number; text: string }>;
  onStartGame?: () => void;
  isHost?: boolean;
}

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || 'your_bot';

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
  onReseat,
  recentMessages = [],
  onStartGame,
  isHost = true
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [reseatToast, setReseatToast] = useState<string | null>(null);
  const totalSeats = Math.max(maxPlayers || 8, players.length, 4);

  // Precise ellipse seat layout: angle = 2π/N * i - π/2, rx=42%, ry=38%.
  // Anchored so MY seat sits at the bottom center (angle offset preserves circular order).
  const { seatCoordinates, playerMap } = useMemo(() => {
    const coords: Record<number, { x: number; y: number }> = {};
    const map: Record<number, PublicPlayer> = {};

    players.forEach((p) => {
      map[p.seat_number] = p;
    });

    const radiusX = 42;
    const radiusY = 38;

    for (let i = 0; i < totalSeats; i++) {
      const seat = i + 1;
      const relIdx = (seat - mySeatNumber + totalSeats) % totalSeats;
      const angle = (2 * Math.PI * relIdx) / totalSeats - Math.PI / 2;

      const x = 50 + radiusX * Math.cos(angle);
      const y = 50 + radiusY * Math.sin(angle);

      coords[seat] = {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      };
    }

    return { seatCoordinates: coords, playerMap: map };
  }, [players, mySeatNumber, totalSeats]);

  const canReseat = phase === 'lobby';

  const handleSeatClick = useCallback((seatNumber: number) => {
    if (phase !== 'lobby') return;
    onReseat(seatNumber);
    setReseatToast(`Вы пересели на место #${seatNumber}`);
    setTimeout(() => setReseatToast(null), 2000);
  }, [phase, onReseat]);

  const handleInvite = async () => {
    const inviteUrl = `https://t.me/${BOT_USERNAME}?startapp=${roomId}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {}

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      try {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent('Присоединяйся к игре в MAFIRO!')}`);
      } catch {}
    }

    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Felt background class according to phase
  const feltBgClass = useMemo(() => {
    switch (phase) {
      case 'night':
        return 'bg-gradient-to-br from-[#0B1226] via-[#0E1726] to-[#0B1226]';
      case 'day':
      case 'vote':
      case 'last_word':
        return 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950';
      default:
        return 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950';
    }
  }, [phase]);

  const feltGlow = useMemo(() => {
    switch (phase) {
      case 'night':
        return '0 0 40px 8px rgba(99, 102, 241, 0.25)';
      case 'vote':
      case 'last_word':
        return '0 0 40px 8px rgba(220, 38, 38, 0.35)';
      default:
        return '0 0 40px 8px rgba(220, 38, 38, 0.35)';
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

  return (
    <div className="relative w-full flex-1 min-h-0 flex items-center justify-center p-2 select-none overflow-hidden">
      {/* Outer obsidian rim */}
      <div
        className="relative w-full h-full rounded-[80px] p-2 bg-[#05070B] border-2 border-red-900/60 flex items-center justify-center overflow-hidden"
        style={{ boxShadow: feltGlow }}
      >
        {/* Table Felt Surface */}
        <div className={`relative w-full h-full rounded-[72px] transition-colors duration-700 flex items-center justify-center overflow-visible ${feltBgClass}`}>
          {/* Inner felt highlight */}
          <div
            className="absolute inset-0 rounded-[72px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
          />
          {/* Elegant table label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span className="font-serif text-[11px] tracking-[0.3em] uppercase text-amber-400/60">
              MAFIRO CLUB
            </span>
          </div>

          {/* Table Center Info & Minimalist Lobby Controls */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 py-2 text-center">
            {/* Phase Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#05070B]/90 border backdrop-blur-md shadow-md mb-1 ${phaseInfo.badgeBorder}`}>
              {phaseInfo.icon}
              <span className={`font-serif tracking-widest text-[11px] font-bold uppercase ${phaseInfo.color}`}>
                {phaseInfo.title}
              </span>
            </div>

            {/* Countdown Timer during Match */}
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
                    onClick={handleInvite}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all duration-200 active:scale-95"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    <span>{copiedLink ? 'Скопировано!' : 'Пригласить'}</span>
                  </button>

                  {/* Start Match Button */}
                  <button
                    type="button"
                    onClick={onStartGame}
                    disabled={players.length < 4}
                    className={`px-4 py-2.5 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                      players.length >= 4
                        ? 'bg-gradient-to-r from-[#FF2A55] to-[#A3122F] text-white shadow-gold-glow cursor-pointer'
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

          {/* ALL SEATS */}
          {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seatNum) => {
            const coord = seatCoordinates[seatNum] || { x: 50, y: 50 };
            const player = playerMap[seatNum];

            return (
              <PlayerSeat
                key={`seat-${seatNum}`}
                player={player}
                seatNumber={seatNum}
                isMe={player?.seat_number === mySeatNumber}
                isSelectedTarget={selectedTargetSeat === seatNum}
                canTarget={canTarget && !!player && player.is_alive && player.seat_number !== mySeatNumber}
                canReseat={canReseat && !player && seatNum !== mySeatNumber}
                onSelect={onSelectTarget}
                onSeatClick={handleSeatClick}
                xPercent={coord.x}
                yPercent={coord.y}
                currentSpeechText={player ? speechMap[player.seat_number] : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Reseat toast (bottom-center) */}
      {reseatToast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in pointer-events-none whitespace-nowrap">
          {reseatToast}
        </div>
      )}
    </div>
  );
};
