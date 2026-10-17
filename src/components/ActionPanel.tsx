import React from 'react';
import type { Phase, Role, PublicPlayer } from '../types/game';
import { Crosshair, Shield, Search, Heart, UserX, Check, X } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface ActionPanelProps {
  phase: Phase;
  myRole?: Role;
  isAlive: boolean;
  canAct: boolean;
  selectedTargetSeat?: number;
  players: PublicPlayer[];
  onConfirmAction: () => void;
  onClearAction: () => void;
  onSkipVote: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  phase,
  myRole,
  isAlive,
  canAct,
  selectedTargetSeat,
  players,
  onConfirmAction,
  onClearAction,
  onSkipVote
}) => {
  // Never show in lobby or game over (lobby controls are inside OvalTable)
  if (phase === 'lobby' || phase === 'game_over' || !isAlive) {
    return null;
  }

  const targetPlayer = players.find((p) => p.seat_number === selectedTargetSeat);

  // Voting Phase Controls
  if (phase === 'vote') {
    return (
      <div className="w-full px-3 py-1.5 bg-[#1A080D]/95 border-t border-red-500/30 flex items-center justify-between gap-2 z-20">
        <span className="text-xs text-red-200 font-sans truncate">
          {targetPlayer ? `Голос: #${targetPlayer.seat_number} ${targetPlayer.first_name}` : 'Выберите подозреваемого на столе'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkipVote}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-gray-300 text-xs font-medium hover:border-white/30 active:scale-95"
          >
            Скип
          </button>

          {targetPlayer && (
            <button
              type="button"
              onClick={() => {
                sounds.playGavel();
                onConfirmAction();
              }}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-crimson-glow active:scale-95"
            >
              <Check className="w-3.5 h-3.5" /> Подтвердить
            </button>
          )}
        </div>
      </div>
    );
  }

  // Night Action Controls
  if (phase === 'night' && canAct) {
    let actionTitle = 'Выбрать';
    let actionIcon = <Crosshair className="w-3.5 h-3.5" />;
    let btnColor = 'bg-[#D4AF37] text-black';

    if (myRole === 'mafia' || myRole === 'don') {
      actionTitle = 'Устранить';
      actionIcon = <Crosshair className="w-3.5 h-3.5 text-white" />;
      btnColor = 'bg-red-700 text-white shadow-crimson-glow';
    } else if (myRole === 'doctor') {
      actionTitle = 'Вылечить';
      actionIcon = <Shield className="w-3.5 h-3.5 text-white" />;
      btnColor = 'bg-emerald-600 text-white shadow-emerald-glow';
    } else if (myRole === 'sheriff') {
      actionTitle = 'Проверить';
      actionIcon = <Search className="w-3.5 h-3.5 text-white" />;
      btnColor = 'bg-amber-600 text-white shadow-sm';
    } else if (myRole === 'mistress') {
      actionTitle = 'Блокировать';
      actionIcon = <Heart className="w-3.5 h-3.5 text-white" />;
      btnColor = 'bg-pink-600 text-white shadow-sm';
    } else if (myRole === 'maniac') {
      actionTitle = 'Убить';
      actionIcon = <UserX className="w-3.5 h-3.5 text-white" />;
      btnColor = 'bg-red-800 text-white shadow-crimson-glow';
    }

    return (
      <div className="w-full px-3 py-1.5 bg-[#090D18]/95 border-t border-indigo-500/30 flex items-center justify-between gap-2 z-20">
        <span className="text-xs text-indigo-200 font-sans truncate">
          {targetPlayer ? `Цель: #${targetPlayer.seat_number} ${targetPlayer.first_name}` : 'Выберите цель на столе'}
        </span>

        {targetPlayer && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClearAction}
              className="p-1 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (myRole === 'mafia' || myRole === 'don' || myRole === 'maniac') {
                  sounds.playShot();
                } else {
                  sounds.playCoin();
                }
                onConfirmAction();
              }}
              className={`px-3 py-1 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all ${btnColor}`}
            >
              {actionIcon} {actionTitle}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
