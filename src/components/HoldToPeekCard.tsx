import React from 'react';
import type { PrivatePlayerState } from '../types/game';
import { Lock, Award, Users, Shield } from 'lucide-react';

interface HoldToPeekCardProps {
  myState?: PrivatePlayerState;
  isVisible: boolean;
  isGameOver?: boolean;
}

export const HoldToPeekCard: React.FC<HoldToPeekCardProps> = ({
  myState,
  isVisible,
  isGameOver = false
}) => {
  if (!myState || (!isVisible && !isGameOver)) return null;

  const isSyndicate = myState.role === 'don' || myState.role === 'mafia';
  const isTown = myState.role === 'citizen' || myState.role === 'sheriff' || myState.role === 'doctor' || myState.role === 'mistress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-fade-in pointer-events-none select-none">
      {/* 3D Flip Card Container */}
      <div className="w-[300px] h-[400px] perspective-1000 animate-[messageIn_0.25s_ease-out]">
        <div className="relative w-full h-full duration-500 transform-style-3d rotate-y-180">
          
          {/* ================= CARD BACK ================= */}
          <div className="absolute inset-0 backface-hidden rounded-2xl p-4 bg-[#0B0E14] border border-[#FF2A55]/40 shadow-luxury flex flex-col items-center justify-between overflow-hidden">
            {/* Holographic edge sheen */}
            <div className="absolute inset-0 holo-sheen rounded-2xl pointer-events-none" />
            {/* Top Ornamental Rim */}
            <div className="w-full flex items-center justify-between px-2 pt-1">
              <span className="font-mono text-xs text-[#FF2A55] font-bold">#{myState.seat_number}</span>
              <span className="font-serif text-[11px] text-[#FF2A55] tracking-widest uppercase">Secret Role</span>
              <Lock className="w-4 h-4 text-[#FF2A55]" />
            </div>

            {/* Center MAFIRO Emblem */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2A0812] to-[#0B0E14] border-2 border-[#FF2A55] flex items-center justify-center shadow-gold-glow mb-3">
                <span className="text-3xl">🎩</span>
              </div>
              <h3 className="font-serif text-lg font-bold tracking-widest text-[#FF8FA5] uppercase">
                MAFIRO
              </h3>
              <p className="text-[10px] text-[#A0AEC0] tracking-wider mt-1 uppercase">
                Private & Confidential
              </p>
            </div>

            <div className="w-full text-center pb-2 text-[11px] font-mono text-[#FF2A55]/80">
              Отпустите для скрытия карты
            </div>
          </div>

          {/* ================= CARD FRONT (Face Up on Hold) ================= */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 border-2 shadow-luxury flex flex-col justify-between overflow-hidden ${
              isSyndicate
                ? 'bg-gradient-to-b from-[#220B10] via-[#120508] to-[#0A0305] border-red-500/60 shadow-crimson-glow'
                : isTown
                ? 'bg-gradient-to-b from-[#092218] via-[#05130D] to-[#040D09] border-emerald-500/60 shadow-gold-glow'
                : 'bg-gradient-to-b from-[#2A0812] via-[#170409] to-[#0A0702] border-[#FF2A55]/60 shadow-gold-glow'
            }`}
          >
            {/* Holographic edge sheen */}
            <div className="absolute inset-0 holo-sheen rounded-2xl pointer-events-none" />

            {/* Header: Team & Role Badge */}
            <div className="relative flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-4xl drop-shadow-lg">{myState.role_icon}</span>
                <div>
                  <h4 className="font-serif font-black text-lg tracking-wide text-white leading-tight">
                    {myState.role_title}
                  </h4>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isSyndicate ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {myState.role_team}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-black/60 border border-[#FF2A55]/50 font-mono text-xs font-bold text-[#FF2A55]">
                #{myState.seat_number}
              </div>
            </div>

            {/* Description */}
            <div className="my-auto py-2">
              <p className="text-xs text-[#E2E8F0] leading-relaxed font-sans">
                {myState.role_description}
              </p>
            </div>

            {/* Extra Info: Syndicate Teammates or Inspection results */}
            <div className="w-full pt-3 border-t border-white/10">
              {isSyndicate && myState.teammates.length > 0 ? (
                <div className="flex flex-col gap-1 text-[11px] text-red-300">
                  <div className="flex items-center gap-1 font-semibold text-red-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Семья (Синдикат):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {myState.teammates.map((t) => (
                      <span key={t.seat_number} className="bg-red-950/80 px-2 py-0.5 rounded border border-red-800 font-mono text-[10px]">
                        #{t.seat_number} {t.first_name} ({t.role_title})
                      </span>
                    ))}
                  </div>
                </div>
              ) : myState.inspection_result ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Проверка #{myState.inspection_result.inspected_seat}:</span>
                  <span className="font-bold underline text-white">{myState.inspection_result.inspected_result}</span>
                </div>
              ) : myState.has_first_night_shield ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Активен Бронежилет Первой Ночи</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#A0AEC0] italic text-center font-mono">
                  Никому не показывайте этот экран
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
