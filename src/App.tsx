import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useGameSocket } from './hooks/useGameSocket';
import type { UserProfile, RoomSummary } from './types/game';
import { LobbyHub } from './components/LobbyHub';
import { OvalTable } from './components/OvalTable';
import { HoldToPeekCard } from './components/HoldToPeekCard';
import { ChatDock } from './components/ChatDock';
import { ActionPanel } from './components/ActionPanel';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ProfileModal } from './components/ProfileModal';
import { GameOverModal } from './components/GameOverModal';
import { sounds } from './utils/sounds';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';

import { localGameEngine } from './utils/localGameEngine';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : '/api/v1';

export const App: React.FC = () => {
  const { user: tgUser, startParam, triggerHaptic } = useTelegram();

  // User State (Distinct per tab using sessionStorage for multi-tab testing in Bolt.new)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const cached = sessionStorage.getItem('mafiro_profile');
      if (cached) return JSON.parse(cached);
    } catch {}

    const randSeed = Math.random().toString(36).substring(2, 6);
    const titles = ['Джентльмен', 'Барон', 'Виконт', 'Дон', 'Капитан', 'Консул', 'Маэстро'];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const initial: UserProfile = {
      id: 'user_' + Math.random().toString(36).substring(2, 8),
      username: 'player_' + randSeed,
      first_name: `${title} #${randSeed}`,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=user_${randSeed}`,
      mmr: 1200,
      bucks: 0,
      stars: 0,
      games_played: 0,
      games_won: 0,
      inventory: []
    };
    try {
      sessionStorage.setItem('mafiro_profile', JSON.stringify(initial));
    } catch {}
    return initial;
  });

  // App Navigation View: 'lobby' | 'table'
  const [currentView, setCurrentView] = useState<'lobby' | 'table'>('lobby');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Rooms and Modals State
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hold-to-Peek Role Card Modal State
  const [isPeekingRole, setIsPeekingRole] = useState(false);

  // Selected Target Seat
  const [selectedTargetSeat, setSelectedTargetSeat] = useState<number | undefined>(undefined);

  // Authenticate user with backend (graceful fallback)
  useEffect(() => {
    const loginUser = async () => {
      try {
        const payload = {
          user_id: tgUser ? String(tgUser.id) : userProfile.id,
          username: tgUser?.username || userProfile.username,
          first_name: tgUser?.first_name || userProfile.first_name,
          avatar_url: tgUser?.photo_url || userProfile.avatar_url
        };

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
          try {
            sessionStorage.setItem('mafiro_profile', JSON.stringify(data.user));
          } catch {}
        }
      } catch (err) {
        // Safe fallback in standalone / Bolt.new environments
        console.warn('Auth using local state fallback:', err);
      }
    };

    loginUser();
  }, [tgUser]);

  // Load Rooms list with local engine fallback
  const refreshRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
          return;
        }
      }
    } catch {}

    // Standalone fallback: get rooms from localGameEngine
    const local = localGameEngine.getRooms();
    setRooms(local);
  }, []);

  useEffect(() => {
    refreshRooms();
    const interval = setInterval(refreshRooms, 3000);
    return () => clearInterval(interval);
  }, [refreshRooms]);

  // Handle deep-link (?startapp=room_XXXX)
  useEffect(() => {
    if (startParam && startParam.startsWith('room_')) {
      handleJoinRoom(startParam);
    }
  }, [startParam]);

  // WebSocket Connection
  const {
    gameState,
    sendAction,
    clearAction,
    sendChat,
    startGame,
    leaveRoom
  } = useGameSocket({
    roomId: activeRoomId || '',
    userId: userProfile.id,
    username: userProfile.username,
    firstName: userProfile.first_name,
    avatarUrl: userProfile.avatar_url
  });

  const handleQuickMatch = () => {
    sounds.playCoin();
    triggerHaptic('medium');
    const availableRooms = rooms.length > 0 ? rooms : localGameEngine.getRooms();
    if (availableRooms.length > 0) {
      handleJoinRoom(availableRooms[0].room_id);
    } else {
      handleCreateRoom({
        name: 'Стол MAFIRO #1',
        max_players: 8,
        is_blitz: false,
        role_reveal_on_death: true
      });
    }
  };

  const handleJoinRoom = (roomId: string) => {
    sounds.playCoin();
    triggerHaptic('medium');
    setActiveRoomId(roomId);
    setCurrentView('table');
  };

  const handleLeaveTable = () => {
    sounds.playCoin();
    triggerHaptic('light');
    leaveRoom();
    setActiveRoomId(null);
    setCurrentView('lobby');
    setSelectedTargetSeat(undefined);
    setIsPeekingRole(false);
    refreshRooms();
  };

  const handleCreateRoom = async (config: {
    name: string;
    max_players: number;
    is_blitz: boolean;
    role_reveal_on_death: boolean;
  }) => {
    sounds.playCoin();
    triggerHaptic('medium');

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          host_id: userProfile.id,
          max_players: config.max_players,
          is_blitz: config.is_blitz,
          bot_fill: false,
          role_reveal_on_death: config.role_reveal_on_death
        })
      });

      if (res.ok) {
        const room = await res.json();
        setIsCreateModalOpen(false);
        handleJoinRoom(room.room_id);
        return;
      }
    } catch (err) {
      console.warn('Backend room creation failed, falling back to local engine:', err);
    }

    // LocalStorage fallback room creation
    const room = localGameEngine.createRoom(
      config.name,
      config.max_players,
      config.is_blitz,
      userProfile.id
    );
    setIsCreateModalOpen(false);
    refreshRooms();
    handleJoinRoom(room.room_id);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-[430px] mx-auto bg-[#07090E] text-[#E5E0D8] overflow-hidden flex flex-col font-sans select-none">
      
      {/* ================= SCREEN 1: LOBBY HUB ================= */}
      {currentView === 'lobby' && (
        <LobbyHub
          user={userProfile}
          rooms={rooms}
          onQuickMatch={handleQuickMatch}
          onJoinRoom={handleJoinRoom}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* ================= SCREEN 2: GAME ROOM TABLE ================= */}
      {currentView === 'table' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Top Bar Navigation */}
          <div className="w-full px-3 py-2 bg-[#090D15]/95 border-b border-white/10 flex items-center justify-between z-30 backdrop-blur-md">
            <button
              type="button"
              onClick={handleLeaveTable}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141A26] border border-white/10 hover:border-[#D4AF37] text-xs text-gray-300 font-medium active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> В лобби
            </button>

            {/* Sleek Compact Hold-to-Peek Trigger Button */}
            {gameState?.me && gameState.phase !== 'lobby' && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsPeekingRole(true);
                  triggerHaptic('medium');
                  sounds.playCardFlip();
                }}
                onPointerUp={() => {
                  setIsPeekingRole(false);
                  triggerHaptic('light');
                  sounds.playCardFlip();
                }}
                onPointerLeave={() => {
                  if (isPeekingRole) {
                    setIsPeekingRole(false);
                    triggerHaptic('light');
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsPeekingRole(true);
                  triggerHaptic('medium');
                  sounds.playCardFlip();
                }}
                onTouchEnd={() => {
                  setIsPeekingRole(false);
                  triggerHaptic('light');
                }}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-serif font-black text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 select-none ${
                  isPeekingRole
                    ? 'bg-[#D4AF37] text-black border-[#FFF3B0] shadow-gold-glow'
                    : 'bg-[#141A26] border-[#D4AF37]/50 text-[#FFF3B0] hover:border-[#D4AF37]'
                }`}
              >
                <span>🃏</span> МОЯ РОЛЬ <span className="text-[9px] opacity-75 font-mono">(УДЕРЖИВАЙ)</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-[#141A26] border border-white/10 text-gray-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
            </button>
          </div>

          {/* Oval Table Area (Clean 54% Height with all seats and in-felt lobby controls) */}
          <div className="relative flex-1 w-full flex flex-col items-center justify-between overflow-hidden">
            <OvalTable
              players={gameState?.players || []}
              mySeatNumber={gameState?.me?.seat_number}
              maxPlayers={gameState?.max_players || 8}
              roomName={gameState?.room_name}
              roomId={gameState?.room_id}
              phase={gameState?.phase || 'lobby'}
              phaseTimeLeft={gameState?.phase_time_left || 0}
              dayNumber={gameState?.day_number || 1}
              activeTargets={gameState?.active_targets || []}
              selectedTargetSeat={selectedTargetSeat}
              canTarget={Boolean(gameState?.me?.can_act)}
              onSelectTarget={(seat) => {
                triggerHaptic('light');
                setSelectedTargetSeat((prev) => (prev === seat ? undefined : seat));
              }}
              recentMessages={gameState?.messages}
              onStartGame={startGame}
              isHost={gameState?.host_id === userProfile.id}
            />

            {/* Contextual Action Panel (Night abilities & Court voting) */}
            <ActionPanel
              phase={gameState?.phase || 'lobby'}
              myRole={gameState?.me?.role}
              isAlive={Boolean(gameState?.me?.is_alive)}
              canAct={Boolean(gameState?.me?.can_act)}
              selectedTargetSeat={selectedTargetSeat}
              players={gameState?.players || []}
              onConfirmAction={() => {
                if (selectedTargetSeat) {
                  sendAction(selectedTargetSeat);
                  setSelectedTargetSeat(undefined);
                }
              }}
              onClearAction={() => {
                clearAction();
                setSelectedTargetSeat(undefined);
              }}
              onSkipVote={() => {
                clearAction();
                setSelectedTargetSeat(undefined);
              }}
            />
          </div>

          {/* Chat Dock (Telegram-style 38% height) */}
          <ChatDock
            messages={gameState?.messages || []}
            myRole={gameState?.me?.role}
            mySeatNumber={gameState?.me?.seat_number}
            isAlive={Boolean(gameState?.me?.is_alive)}
            phase={gameState?.phase || 'lobby'}
            onSendMessage={(text, channel) => sendChat(text, channel)}
          />

          {/* Full Screen Hold-to-Peek 3D Modal Overlay */}
          <HoldToPeekCard
            myState={gameState?.me}
            isVisible={isPeekingRole}
            isGameOver={gameState?.phase === 'game_over'}
          />

          {/* Game Over Modal */}
          {gameState?.phase === 'game_over' && (
            <GameOverModal
              winner={gameState.winner}
              winnerTitle={gameState.winner_title}
              players={gameState.players}
              mySeatNumber={gameState.me?.seat_number}
              onReturnToLobby={handleLeaveTable}
            />
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={userProfile}
        onUpdateUser={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
};

export default App;
