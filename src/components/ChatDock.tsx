import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatChannel, Phase, Role } from '../types/game';
import { Send, Moon, Radio } from 'lucide-react';
import { getAvatarGradient } from '../utils/avatar';

interface ChatDockProps {
  messages: ChatMessage[];
  myRole?: Role;
  mySeatNumber?: number;
  isAlive: boolean;
  phase: Phase;
  onSendMessage: (text: string, channel: ChatChannel) => void;
}

export const ChatDock: React.FC<ChatDockProps> = ({
  messages,
  myRole,
  mySeatNumber,
  isAlive,
  phase,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isMafia = myRole === 'don' || myRole === 'mafia';
  const isNight = phase === 'night';
  const isNightCitizen = isNight && !isMafia && isAlive;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const channel: ChatChannel = (isNight && isMafia) ? 'syndicate' : (!isAlive ? 'ghost' : 'public');
    onSendMessage(inputText.trim(), channel);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Only real player messages + minimal system phase dividers. No join/leave/seat spam.
  const displayMessages = messages.filter((m) => {
    if (!m.is_system && (!m.text || !m.text.trim())) return false;
    if (m.channel === 'syndicate') return isMafia;
    if (m.channel === 'ghost') return !isAlive || phase === 'game_over';
    return m.channel === 'public' || m.channel === 'system' || m.is_system;
  });

  // Minimal system metadata that survives as muted dividers (phase transitions only)
  const isPhaseDivider = (text: string): boolean => {
    const t = text.toLowerCase();
    const isSeatSpam =
      t.includes('занял место') ||
      t.includes('покинул стол') ||
      t.includes('пересел') ||
      t.includes('бросает');
    const isPhaseMeta =
      t.includes('игра началась') ||
      t.includes('карты сданы') ||
      t.includes('наступает ночь') ||
      t.includes('город просыпается') ||
      t.includes('время голосования') ||
      t.includes('раунд заверш') ||
      t.includes('убит') ||
      t.includes('исключен') ||
      t.includes('никто не был казнен') ||
      t.includes('никто не погиб') ||
      t.includes('победа');
    return !isSeatSpam && (isPhaseMeta || text.length < 1);
  };

  return (
    <div className="relative w-full h-[38dvh] bg-[#05070B]/95 border-t border-white/10 flex flex-col justify-between backdrop-blur-xl z-20">

      {/* Night Mafia Badge if active */}
      {isNight && isMafia && isAlive && (
        <div className="w-full px-3 py-1 bg-red-950/60 border-b border-red-900/40 flex items-center justify-center gap-1.5 text-[11px] text-red-300 font-medium">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>🔴 Зашифрованный ночной канал Мафии</span>
        </div>
      )}

      {/* ================= Messages Log (Telegram-style clean scroll) ================= */}
      <div
        ref={chatScrollRef}
        className="flex-1 w-full p-3 overflow-y-auto space-y-1.5 font-sans text-xs select-text no-scrollbar scroll-smooth"
      >
        {isNightCitizen ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Moon className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
            <p className="font-serif text-sm font-bold text-indigo-200">Город спит...</p>
            <p className="text-[11px] text-[#A0AEC0] max-w-[240px] mt-1">
              Мирные жители не могут общаться до рассвета.
            </p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs italic">
            Чат пуст. Напишите первое сообщение...
          </div>
        ) : (
          displayMessages.map((m) => {
            // Minimal system metadata: centered muted divider (phase transitions only)
            if (m.is_system) {
              if (!isPhaseDivider(m.text)) return null;
              return (
                <div key={m.id} className="py-1 text-center">
                  <span className="text-white/30 text-xs">
                    {m.text}
                  </span>
                </div>
              );
            }

            const isMyMsg = m.sender_seat === mySeatNumber;
            const isSyndicateMsg = m.channel === 'syndicate';
            const gradient = getAvatarGradient(m.sender_name || m.sender_id);

            return (
              <div
                key={m.id}
                className={`flex flex-col animate-message-in ${isMyMsg ? 'items-end' : 'items-start'}`}
              >
                {!isMyMsg && (
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span
                      className="font-mono text-[9px] font-bold px-1 rounded"
                      style={{
                        color: gradient.from,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      #{m.sender_seat}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: gradient.from }}>
                      {m.sender_name}
                    </span>
                    {isSyndicateMsg && (
                      <span className="text-[8px] font-mono text-red-400 bg-red-950 px-1 rounded">
                        МАФИЯ
                      </span>
                    )}
                    <span className="text-[9px] text-white/30">
                      {new Date(m.timestamp * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-2xl break-words text-[11px] leading-relaxed shadow-sm ${
                    isMyMsg
                      ? isSyndicateMsg
                        ? 'bg-red-800 text-white rounded-tr-none'
                        : 'bg-blue-600/70 text-white rounded-br-sm'
                      : isSyndicateMsg
                      ? 'bg-red-950/90 border border-red-800/60 text-red-100 rounded-tl-none'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= Input Field (Pinned bottom) ================= */}
      <div className="w-full p-2.5 bg-[#05070B] border-t border-white/5 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isNightCitizen || (!isAlive && phase !== 'last_word')}
          placeholder={
            isNightCitizen
              ? "🌙 Город спит..."
              : isNight && isMafia
              ? "🔴 Сообщение для Мафии..."
              : !isAlive
              ? "👻 Чат призраков..."
              : "Написать в чат..."
          }
          className="flex-1 bg-white/10 border border-white/15 focus:border-white/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none transition-all disabled:opacity-40"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isNightCitizen || !inputText.trim() || (!isAlive && phase !== 'last_word')}
          className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2.5 text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
