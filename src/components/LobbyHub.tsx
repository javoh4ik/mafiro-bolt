import React from 'react';
import type { UserProfile, RoomSummary } from '../types/game';
import { Play, Plus, DoorOpen, Users, ChevronRight, Zap } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface LobbyHubProps {
  user: UserProfile;
  rooms: RoomSummary[];
  onQuickMatch: () => void;
  onJoinRoom: (roomId: string) => void;
  onOpenCreateModal: () => void;
  onOpenProfileModal: () => void;
}

export const LobbyHub: React.FC<LobbyHubProps> = ({
  user,
  rooms,
  onQuickMatch,
  onJoinRoom,
  onOpenCreateModal,
  onOpenProfileModal
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar select-none">
      
      {/* ================= 1. CLICKABLE PROFILE CARD ================= */}
      <div
        onClick={() => {
          sounds.playCoin();
          onOpenProfileModal();
        }}
        className="w-full p-3 rounded-2xl bg-[#0A0E17] border border-white/10 hover:border-[#FF2A55]/50 shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-[#FF2A55] p-0.5 bg-[#121A2A]">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || user.id}`}
              alt={user.first_name}
              className="w-full h-full rounded-full object-cover bg-[#05070B]"
            />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-white">
              {user.first_name}
            </h3>
            <p className="text-[11px] text-[#A0AEC0] font-mono">
              {user.games_played} игр • {user.games_won} побед
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-serif text-[#FF2A55] font-semibold">
          <span>Мой профиль</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* ================= 2. HERO BRANDING & ACTIONS ================= */}
      <div className="my-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2A0812] to-[#0B0E14] border-2 border-[#FF2A55] flex items-center justify-center shadow-gold-glow mb-2 animate-pulse-subtle">
          <span className="text-3xl">🎩</span>
        </div>

        <h1 className="font-serif text-3xl font-black tracking-widest text-[#FF8FA5] uppercase drop-shadow">
          MAFIRO
        </h1>
        <p className="text-xs text-[#A0AEC0] max-w-[260px] mt-1 font-sans">
          Психологическая онлайн-мафия. Играйте с друзьями или в открытых комнатах.
        </p>

        {/* 2 Big Action Buttons */}
        <div className="w-full mt-4 flex flex-col gap-2.5">
          {/* Action 1: Быстрая игра */}
          <button
            type="button"
            onClick={onQuickMatch}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2A55] via-[#FF8FA5] to-[#FF2A55] text-white font-serif font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-gold-glow active:scale-98 transition-transform"
          >
            <Play className="w-4 h-4 fill-black" /> БЫСТРАЯ ИГРА
          </button>

          {/* Action 2: Создать комнату */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full py-3 rounded-xl bg-[#0A0E17] border border-[#FF2A55]/40 hover:border-[#FF2A55] text-white font-serif text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#FF2A55]" /> СОЗДАТЬ КОМНАТУ
          </button>
        </div>
      </div>

      {/* ================= 3. DEDICATED ROOMS LIST ================= */}
      <div className="flex-1 w-full flex flex-col mt-1">
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#FF2A55] flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4" /> КОМНАТЫ ({rooms.length})
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Live Rooms</span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar max-h-[220px]">
          {rooms.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#0A0E17]/50 border border-white/5 text-center text-xs text-gray-400">
              Пока нет открытых комнат. Создайте свою!
            </div>
          ) : (
            rooms.map((r) => {
              const isLobby = r.phase === 'lobby';

              return (
                <div
                  key={r.room_id}
                  className="p-3 rounded-2xl bg-[#0A0E17] border border-white/10 hover:border-[#FF2A55]/40 flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs text-white">
                        {r.name}
                      </span>
                      {r.is_blitz && (
                        <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800">
                          <Zap className="w-2.5 h-2.5" /> Блиц
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#FF2A55]" />
                        <b className="text-white">{r.player_count} / {r.max_players}</b>
                      </span>
                      <span>•</span>
                      <span className={isLobby ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {isLobby ? 'Ожидание' : 'В игре'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJoinRoom(r.room_id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#121A2A] border border-white/10 hover:border-[#FF2A55] text-white font-serif font-bold text-xs tracking-wider transition-all active:scale-95"
                  >
                    Войти
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
