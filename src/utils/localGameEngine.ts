import type { 
  Role, Phase, ChatChannel, ThrowableItem,
  PublicPlayer, PrivatePlayerState, ChatMessage,
  TargetVector, ThrowableEvent, GameStatePayload,
  RoomSummary, TeammateInfo
} from '../types/game';

export const ROLE_INFO: Record<Role, { title: string; team: string; description: string; icon: string }> = {
  don: {
    title: 'Дон Мафии',
    team: 'Синдикат',
    description: 'Глава криминальной семьи. Ночью координирует выстрел и ищет Шерифа города.',
    icon: '👑'
  },
  mafia: {
    title: 'Мафия',
    team: 'Синдикат',
    description: 'Боевик Синдиката. Ночью голосует за устранение мирных жителей.',
    icon: '🕶️'
  },
  sheriff: {
    title: 'Шериф',
    team: 'Город',
    description: 'Комиссар полиции. Каждую ночь проверяет одного жителя на связь с мафией.',
    icon: '⭐'
  },
  doctor: {
    title: 'Доктор',
    team: 'Город',
    description: 'Хирург подпольного госпиталя. Каждую ночь спасает одного жителя от пули.',
    icon: '💉'
  },
  mistress: {
    title: 'Любовница',
    team: 'Город',
    description: 'Роковая красотка. Ночью лишает выбранного жителя возможности действовать.',
    icon: '💋'
  },
  maniac: {
    title: 'Маньяк',
    team: 'Одиночка',
    description: 'Кровавый психопат. Играет сам за себя, убивая жертву каждую ночь.',
    icon: '🔪'
  },
  citizen: {
    title: 'Мирный житель',
    team: 'Город',
    description: 'Честный гражданин Нуар-Сити. Днем разоблачает преступников на общем суде.',
    icon: '⚖️'
  }
};

export const ROLE_TEAMS: Record<Role, 'mafia' | 'town' | 'maniac'> = {
  don: 'mafia',
  mafia: 'mafia',
  sheriff: 'town',
  doctor: 'town',
  mistress: 'town',
  citizen: 'town',
  maniac: 'maniac'
};

interface LocalInternalPlayer extends PublicPlayer {
  full_role?: Role;
  night_target_seat?: number;
  last_word_left?: boolean;
}

interface LocalRoomData {
  room_id: string;
  room_name: string;
  host_id: string;
  phase: Phase;
  phase_time_left: number;
  day_number: number;
  max_players: number;
  players: LocalInternalPlayer[];
  messages: ChatMessage[];
  active_targets: TargetVector[];
  last_throwable?: ThrowableEvent;
  winner?: 'MAFIA' | 'TOWN' | 'MANIAC' | string;
  winner_title?: string;
  eliminated_player?: PublicPlayer;
  last_updated: number;
}

const ROOMS_KEY = 'mafiro_local_rooms';
const ROOM_PREFIX = 'mafiro_room_state_';

class LocalGameEngine {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(state: GameStatePayload) => void>> = new Map();
  private timer: number | null = null;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('mafiro_sync');
        this.channel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === ROOMS_KEY) {
          // Rooms list changed in another tab
        } else if (e.key && e.key.startsWith(ROOM_PREFIX)) {
          const roomId = e.key.replace(ROOM_PREFIX, '');
          this.notifyRoomSubscribers(roomId);
        }
      });
    }

    this.startHeartbeatTimer();
  }

  private handleBroadcastMessage(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'ROOM_STATE_UPDATED' && data.roomId) {
      this.notifyRoomSubscribers(data.roomId);
    }
  }

  private broadcast(data: any) {
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (err) {
        console.warn('Failed to broadcast:', err);
      }
    }
  }

  // ================= ROOMS MANAGEMENT =================
  public getRooms(): RoomSummary[] {
    try {
      const raw = localStorage.getItem(ROOMS_KEY);
      if (raw) {
        const rooms: RoomSummary[] = JSON.parse(raw);
        if (rooms.length > 0) return rooms;
      }
    } catch {}

    // Default starter room if none exists
    const starterRoom: RoomSummary = {
      room_id: 'room_noir_1',
      name: 'Стол MAFIRO #1',
      host_id: 'host_system',
      player_count: 0,
      max_players: 8,
      phase: 'lobby',
      is_blitz: false
    };
    this.saveRooms([starterRoom]);
    return [starterRoom];
  }

  public saveRooms(rooms: RoomSummary[]) {
    try {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      this.broadcast({ type: 'ROOMS_UPDATED' });
    } catch (e) {
      console.warn('Failed to save rooms:', e);
    }
  }

  public createRoom(name: string, maxPlayers: number, isBlitz: boolean, hostId: string): RoomSummary {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 8);
    const newRoom: RoomSummary = {
      room_id: roomId,
      name: name || `Стол MAFIRO #${Math.floor(Math.random() * 90 + 10)}`,
      host_id: hostId,
      player_count: 0,
      max_players: Math.min(12, Math.max(4, maxPlayers || 8)),
      phase: 'lobby',
      is_blitz: Boolean(isBlitz)
    };

    const rooms = this.getRooms().filter(r => r.phase === 'lobby');
    rooms.unshift(newRoom);
    this.saveRooms(rooms);

    // Initialize room state
    const initialData: LocalRoomData = {
      room_id: roomId,
      room_name: newRoom.name,
      host_id: hostId,
      phase: 'lobby',
      phase_time_left: 0,
      day_number: 1,
      max_players: newRoom.max_players,
      players: [],
      messages: [{
        id: 'msg_init',
        sender_id: 'system',
        sender_seat: 0,
        sender_name: 'MAFIRO',
        text: `Комната "${newRoom.name}" создана на ${newRoom.max_players} мест.`,
        channel: 'system',
        timestamp: Date.now() / 1000,
        is_system: true
      }],
      active_targets: [],
      last_updated: Date.now()
    };
    this.saveRoomData(roomId, initialData);

    return newRoom;
  }

  public getRoomData(roomId: string): LocalRoomData | null {
    try {
      const raw = localStorage.getItem(ROOM_PREFIX + roomId);
      if (raw) return JSON.parse(raw);
    } catch {}

    // If not found in localStorage, construct a default
    const rooms = this.getRooms();
    const found = rooms.find(r => r.room_id === roomId);
    if (found) {
      const defData: LocalRoomData = {
        room_id: roomId,
        room_name: found.name,
        host_id: found.host_id,
        phase: (found.phase as Phase) || 'lobby',
        phase_time_left: 0,
        day_number: 1,
        max_players: found.max_players,
        players: [],
        messages: [{
          id: 'msg_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `Стол ${found.name} готов к игре (${found.max_players} мест).`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        }],
        active_targets: [],
        last_updated: Date.now()
      };
      this.saveRoomData(roomId, defData);
      return defData;
    }

    return null;
  }

  public saveRoomData(roomId: string, data: LocalRoomData) {
    try {
      data.last_updated = Date.now();
      localStorage.setItem(ROOM_PREFIX + roomId, JSON.stringify(data));
      
      // Update room summary count
      const rooms = this.getRooms();
      const idx = rooms.findIndex(r => r.room_id === roomId);
      if (idx !== -1) {
        rooms[idx].player_count = data.players.length;
        rooms[idx].phase = data.phase;
        localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      }

      this.broadcast({ type: 'ROOM_STATE_UPDATED', roomId });
      this.notifyRoomSubscribers(roomId);
    } catch (e) {
      console.warn('Failed to save room data:', e);
    }
  }

  // ================= SUBSCRIPTIONS & CLIENT HOOK =================
  public subscribe(roomId: string, userId: string, callback: (state: GameStatePayload) => void): () => void {
    this.currentRoomId = roomId;
    this.currentUserId = userId;

    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId)!.add(callback);

    // Immediately notify with current state
    const sanitized = this.getSanitizedState(roomId, userId);
    if (sanitized) callback(sanitized);

    return () => {
      const set = this.listeners.get(roomId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(roomId);
      }
      if (this.currentRoomId === roomId) {
        this.currentRoomId = null;
      }
    };
  }

  private notifyRoomSubscribers(roomId: string) {
    const callbacks = this.listeners.get(roomId);
    if (!callbacks || callbacks.size === 0) return;

    callbacks.forEach((cb) => {
      const sanitized = this.getSanitizedState(roomId, this.currentUserId || '');
      if (sanitized) cb(sanitized);
    });
  }

  // ================= STATE SANITIZATION =================
  public getSanitizedState(roomId: string, userId: string): GameStatePayload | null {
    const data = this.getRoomData(roomId);
    if (!data) return null;

    const mePlayer = data.players.find(p => p.id === userId);
    let meState: PrivatePlayerState | undefined = undefined;

    if (mePlayer && mePlayer.full_role) {
      const info = ROLE_INFO[mePlayer.full_role];
      const team = ROLE_TEAMS[mePlayer.full_role];

      // Find teammates if Mafia
      const teammates: TeammateInfo[] = [];
      if (team === 'mafia') {
        data.players.forEach(p => {
          if (p.id !== mePlayer.id && p.full_role && ROLE_TEAMS[p.full_role] === 'mafia') {
            teammates.push({
              seat_number: p.seat_number,
              first_name: p.first_name,
              role_title: ROLE_INFO[p.full_role].title,
              is_alive: p.is_alive
            });
          }
        });
      }

      meState = {
        id: mePlayer.id,
        seat_number: mePlayer.seat_number,
        role: mePlayer.full_role,
        role_title: info.title,
        role_icon: info.icon,
        role_team: info.team,
        role_description: info.description,
        is_alive: mePlayer.is_alive,
        is_blocked: false,
        can_act: mePlayer.is_alive && (
          (data.phase === 'night' && mePlayer.full_role !== 'citizen') ||
          (data.phase === 'vote')
        ),
        teammates,
        has_first_night_shield: false
      };
    }

    // Sanitize players: hide roles during live game, reveal on game_over or death
    const publicPlayers: PublicPlayer[] = data.players.map(p => {
      const isMe = p.id === userId;
      const isGameOver = data.phase === 'game_over';
      const reveal = isMe || isGameOver || !p.is_alive;

      return {
        id: p.id,
        seat_number: p.seat_number,
        username: p.username,
        first_name: p.first_name,
        avatar_url: p.avatar_url,
        is_bot: p.is_bot,
        is_alive: p.is_alive,
        role: reveal ? p.full_role : undefined,
        role_title: reveal && p.full_role ? ROLE_INFO[p.full_role].title : undefined,
        role_icon: reveal && p.full_role ? ROLE_INFO[p.full_role].icon : undefined,
        votes_received: p.votes_received || 0,
        voted_for_seat: p.voted_for_seat
      };
    });

    // Filter messages: night syndicate chat only visible to mafia
    const filteredMessages = data.messages.filter(m => {
      if (m.channel === 'syndicate') {
        if (!mePlayer || !mePlayer.full_role) return false;
        return ROLE_TEAMS[mePlayer.full_role] === 'mafia';
      }
      return true;
    });

    return {
      room_id: data.room_id,
      room_name: data.room_name,
      host_id: data.host_id,
      phase: data.phase,
      phase_time_left: data.phase_time_left,
      day_number: data.day_number,
      max_players: data.max_players,
      players: publicPlayers,
      me: meState,
      messages: filteredMessages,
      active_targets: data.active_targets || [],
      last_throwable: data.last_throwable,
      winner: data.winner,
      winner_title: data.winner_title,
      eliminated_player: data.eliminated_player
    };
  }

  // ================= ACTIONS =================
  public joinRoom(roomId: string, user: { id: string; username: string; first_name: string; avatar_url?: string }) {
    const data = this.getRoomData(roomId);
    if (!data) return;

    // Check if already seated
    let player = data.players.find(p => p.id === user.id);
    if (!player) {
      if (data.phase !== 'lobby') return; // Cannot join running game
      if (data.players.length >= data.max_players) return; // Full

      // Find first empty seat 1..max_players
      const taken = new Set(data.players.map(p => p.seat_number));
      let seat = 1;
      while (taken.has(seat) && seat <= data.max_players) {
        seat++;
      }
      if (seat > data.max_players) return;

      player = {
        id: user.id,
        seat_number: seat,
        username: user.username || `player_${seat}`,
        first_name: user.first_name || `Игрок #${seat}`,
        avatar_url: user.avatar_url,
        is_bot: false,
        is_alive: true,
        votes_received: 0
      };

      data.players.push(player);

      // If first player, make host
      if (data.host_id === 'host_system' || data.players.length === 1) {
        data.host_id = user.id;
      }

      this.saveRoomData(roomId, data);
    }
  }

  public leaveRoom(roomId: string, userId: string) {
    const data = this.getRoomData(roomId);
    if (!data) return;

    const idx = data.players.findIndex(p => p.id === userId);
    if (idx !== -1) {
      data.players.splice(idx, 1);

      // Reassign host if host left
      if (data.host_id === userId && data.players.length > 0) {
        data.host_id = data.players[0].id;
      }

      this.saveRoomData(roomId, data);
    }
  }

  public startGame(roomId: string) {
    const data = this.getRoomData(roomId);
    if (!data || data.phase !== 'lobby') return;

    // In local engine: if testing with < 4 players in Bolt.new preview,
    // add simulated companion seats so the user can test the full game loop!
    const names = ['Витторио', 'Карло', 'Франческо', 'Лоренцо', 'Маттео', 'Сальваторе'];
    while (data.players.length < 4) {
      const taken = new Set(data.players.map(p => p.seat_number));
      let seat = 1;
      while (taken.has(seat)) seat++;

      const botId = 'comp_' + Math.random().toString(36).substring(2, 7);
      const botName = names[data.players.length] || `Игрок #${seat}`;

      data.players.push({
        id: botId,
        seat_number: seat,
        username: botName.toLowerCase(),
        first_name: botName,
        avatar_url: undefined,
        is_bot: true,
        is_alive: true,
        votes_received: 0
      });
    }

    const n = data.players.length;
    let roles: Role[] = [];

    if (n <= 4) {
      roles = ['mafia', 'sheriff', 'doctor', 'citizen'];
    } else if (n === 5) {
      roles = ['mafia', 'sheriff', 'doctor', 'citizen', 'citizen'];
    } else if (n <= 7) {
      roles = ['don', 'mafia', 'sheriff', 'doctor'];
      while (roles.length < n) roles.push('citizen');
    } else if (n <= 9) {
      roles = ['don', 'mafia', 'sheriff', 'doctor', 'mistress'];
      while (roles.length < n) roles.push('citizen');
    } else {
      roles = ['don', 'mafia', 'mafia', 'maniac', 'sheriff', 'doctor', 'mistress'];
      while (roles.length < n) roles.push('citizen');
    }

    // Shuffle roles
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    data.players.forEach((p, idx) => {
      p.full_role = shuffledRoles[idx] || 'citizen';
      p.is_alive = true;
      p.votes_received = 0;
      p.voted_for_seat = undefined;
      p.night_target_seat = undefined;
    });

    data.phase = 'night';
    data.day_number = 1;
    data.phase_time_left = 30;
    data.active_targets = [];
    data.winner = undefined;
    data.winner_title = undefined;

    data.messages.push({
      id: 'sys_' + Date.now(),
      sender_id: 'system',
      sender_seat: 0,
      sender_name: 'MAFIRO',
      text: `Карты сданы! В игре ${n} игроков. Город засыпает, просыпается Мафия...`,
      channel: 'system',
      timestamp: Date.now() / 1000,
      is_system: true
    });

    this.saveRoomData(roomId, data);
  }

  public reseat(roomId: string, userId: string, targetSeat: number) {
    const data = this.getRoomData(roomId);
    if (!data || data.phase !== 'lobby') return;

    const player = data.players.find(p => p.id === userId);
    if (!player) return;
    if (targetSeat === player.seat_number) return;

    const occupant = data.players.find(p => p.seat_number === targetSeat);
    if (occupant) return;
    if (targetSeat < 1 || targetSeat > data.max_players) return;

    player.seat_number = targetSeat;
    this.saveRoomData(roomId, data);
  }

  public sendChat(roomId: string, userId: string, text: string, channel: ChatChannel = 'public') {
    const data = this.getRoomData(roomId);
    if (!data || !text.trim()) return;

    const player = data.players.find(p => p.id === userId);
    if (!player) return;

    // Channel restrictions
    if (data.phase === 'night') {
      if (channel !== 'syndicate') return;
      if (!player.full_role || ROLE_TEAMS[player.full_role] !== 'mafia') return;
    }

    data.messages.push({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      sender_id: player.id,
      sender_seat: player.seat_number,
      sender_name: player.first_name,
      text: text.trim(),
      channel,
      timestamp: Date.now() / 1000,
      is_system: false
    });

    this.saveRoomData(roomId, data);
  }

  public sendAction(roomId: string, userId: string, targetSeat: number) {
    const data = this.getRoomData(roomId);
    if (!data) return;

    const player = data.players.find(p => p.id === userId);
    if (!player || !player.is_alive) return;

    const target = data.players.find(p => p.seat_number === targetSeat && p.is_alive);
    if (!target) return;

    if (data.phase === 'night') {
      player.night_target_seat = targetSeat;

      // Update active targets for visual representation
      const existingIdx = data.active_targets.findIndex(t => t.from_seat === player.seat_number);
      if (existingIdx !== -1) {
        data.active_targets[existingIdx].to_seat = targetSeat;
      } else {
        data.active_targets.push({ from_seat: player.seat_number, to_seat: targetSeat });
      }

      // If Sheriff inspects: give immediate feedback in system log
      if (player.full_role === 'sheriff') {
        const isBlack = target.full_role === 'don' || target.full_role === 'mafia';
        const resultText = isBlack ? 'Черный (Мафия) 🕶️' : 'Красный (Мирный) ⚖️';
        data.messages.push({
          id: 'sys_insp_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'Шериф',
          text: `🔍 Проверка игрока #${target.seat_number} (${target.first_name}): ${resultText}`,
          channel: 'public',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      }

      this.saveRoomData(roomId, data);
    } else if (data.phase === 'vote') {
      player.voted_for_seat = targetSeat;

      // Recalculate votes received
      data.players.forEach(p => { p.votes_received = 0; });
      data.players.forEach(p => {
        if (p.is_alive && p.voted_for_seat) {
          const tgt = data.players.find(t => t.seat_number === p.voted_for_seat);
          if (tgt) tgt.votes_received = (tgt.votes_received || 0) + 1;
        }
      });

      this.saveRoomData(roomId, data);
    }
  }

  public clearAction(roomId: string, userId: string) {
    const data = this.getRoomData(roomId);
    if (!data) return;

    const player = data.players.find(p => p.id === userId);
    if (!player) return;

    if (data.phase === 'night') {
      player.night_target_seat = undefined;
      data.active_targets = data.active_targets.filter(t => t.from_seat !== player.seat_number);
    } else if (data.phase === 'vote') {
      player.voted_for_seat = undefined;
      data.players.forEach(p => { p.votes_received = 0; });
      data.players.forEach(p => {
        if (p.is_alive && p.voted_for_seat) {
          const tgt = data.players.find(t => t.seat_number === p.voted_for_seat);
          if (tgt) tgt.votes_received = (tgt.votes_received || 0) + 1;
        }
      });
    }

    this.saveRoomData(roomId, data);
  }

  public throwItem(roomId: string, fromSeat: number, toSeat: number, item: ThrowableItem) {
    const data = this.getRoomData(roomId);
    if (!data) return;

    const evt: ThrowableEvent = {
      from_seat: fromSeat,
      to_seat: toSeat,
      item,
      timestamp: Date.now() / 1000
    };
    data.last_throwable = evt;

    const names: Record<ThrowableItem, string> = {
      tomato: '🍅 сочный помидор',
      clown: '🤡 клоунский нос',
      rose: '🌹 алую розу',
      loupe: '🔍 детективную лупу'
    };

    data.messages.push({
      id: 'throw_' + Date.now(),
      sender_id: 'system',
      sender_seat: 0,
      sender_name: 'MAFIRO',
      text: `Игрок #${fromSeat} бросает ${names[item] || 'предмет'} в #${toSeat}!`,
      channel: 'system',
      timestamp: Date.now() / 1000,
      is_system: true
    });

    this.saveRoomData(roomId, data);
  }

  // ================= TIMER & PHASE ADVANCEMENT =================
  private startHeartbeatTimer() {
    if (this.timer) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      if (!this.currentRoomId) return;

      const data = this.getRoomData(this.currentRoomId);
      if (!data || data.phase === 'lobby' || data.phase === 'game_over') return;

      // Only host tab drives timer to avoid multi-tab race conditions
      if (data.host_id !== this.currentUserId) return;

      if (data.phase_time_left > 1) {
        data.phase_time_left -= 1;
        this.saveRoomData(this.currentRoomId, data);
      } else {
        this.advancePhase(data);
      }
    }, 1000);
  }

  private advancePhase(data: LocalRoomData) {
    if (data.phase === 'night') {
      // Resolve night: Mafia target, Doctor heal
      let mafiaTargetSeat: number | undefined;
      let doctorHealSeat: number | undefined;

      // Mafia kill priority (Don or first mafia)
      const mafiaPlayers = data.players.filter(p => p.is_alive && (p.full_role === 'don' || p.full_role === 'mafia'));
      for (const m of mafiaPlayers) {
        if (m.night_target_seat) {
          mafiaTargetSeat = m.night_target_seat;
          break;
        }
      }

      // If simulated companions didn't pick, randomly pick a living town target
      if (!mafiaTargetSeat) {
        const livingTown = data.players.filter(p => p.is_alive && p.full_role !== 'don' && p.full_role !== 'mafia');
        if (livingTown.length > 0) {
          mafiaTargetSeat = livingTown[Math.floor(Math.random() * livingTown.length)].seat_number;
        }
      }

      const doc = data.players.find(p => p.is_alive && p.full_role === 'doctor');
      if (doc && doc.night_target_seat) {
        doctorHealSeat = doc.night_target_seat;
      }

      let victim: LocalInternalPlayer | undefined;
      if (mafiaTargetSeat && mafiaTargetSeat !== doctorHealSeat) {
        victim = data.players.find(p => p.seat_number === mafiaTargetSeat);
        if (victim) {
          victim.is_alive = false;
        }
      }

      data.phase = 'day';
      data.phase_time_left = 35;
      data.active_targets = [];

      data.messages.push({
        id: 'sys_' + Date.now(),
        sender_id: 'system',
        sender_seat: 0,
        sender_name: 'MAFIRO',
        text: `☀️ День #${data.day_number}. Город просыпается.`,
        channel: 'system',
        timestamp: Date.now() / 1000,
        is_system: true
      });

      if (victim) {
        const roleTitle = victim.full_role ? ROLE_INFO[victim.full_role].title : 'Житель';
        data.messages.push({
          id: 'sys_kill_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `☠️ Этой ночью убит Игрок #${victim.seat_number} (${victim.first_name}). Роль: ${roleTitle}.`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      } else {
        data.messages.push({
          id: 'sys_peace_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `🕊️ Этой ночью никто не погиб! Доктор отлично справился.`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      }

      this.checkWinCondition(data);
      this.saveRoomData(data.room_id, data);
    } else if (data.phase === 'day') {
      // Transition from day discussion to vote
      data.phase = 'vote';
      data.phase_time_left = 30;
      data.players.forEach(p => {
        p.votes_received = 0;
        p.voted_for_seat = undefined;
      });

      data.messages.push({
        id: 'sys_vote_' + Date.now(),
        sender_id: 'system',
        sender_seat: 0,
        sender_name: 'MAFIRO',
        text: `⚖️ Время голосования! Выберите подозреваемого за столом.`,
        channel: 'system',
        timestamp: Date.now() / 1000,
        is_system: true
      });

      this.saveRoomData(data.room_id, data);
    } else if (data.phase === 'vote') {
      // Resolve voting: eliminate player with highest votes
      let maxVotes = 0;
      let condemned: LocalInternalPlayer | undefined;

      data.players.forEach(p => {
        if (p.is_alive && (p.votes_received || 0) > maxVotes) {
          maxVotes = p.votes_received || 0;
          condemned = p;
        }
      });

      if (condemned && maxVotes > 0) {
        condemned.is_alive = false;
        const roleTitle = condemned.full_role ? ROLE_INFO[condemned.full_role].title : 'Житель';
        data.messages.push({
          id: 'sys_elim_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `⚖️ Решением суда исключен Игрок #${condemned.seat_number} (${condemned.first_name}). Роль: ${roleTitle}.`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      } else {
        data.messages.push({
          id: 'sys_skip_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `⚖️ Голоса разделились. Никто не был казнен на суде.`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      }

      const gameOver = this.checkWinCondition(data);
      if (!gameOver) {
        // Go to next night
        data.phase = 'night';
        data.day_number += 1;
        data.phase_time_left = 30;
        data.players.forEach(p => {
          p.votes_received = 0;
          p.voted_for_seat = undefined;
          p.night_target_seat = undefined;
        });
        data.active_targets = [];

        data.messages.push({
          id: 'sys_night_' + Date.now(),
          sender_id: 'system',
          sender_seat: 0,
          sender_name: 'MAFIRO',
          text: `🌙 Наступает ночь #${data.day_number}. Город засыпает.`,
          channel: 'system',
          timestamp: Date.now() / 1000,
          is_system: true
        });
      }

      this.saveRoomData(data.room_id, data);
    }
  }

  private checkWinCondition(data: LocalRoomData): boolean {
    const aliveMafia = data.players.filter(p => p.is_alive && (p.full_role === 'don' || p.full_role === 'mafia')).length;
    const aliveTown = data.players.filter(p => p.is_alive && p.full_role !== 'don' && p.full_role !== 'mafia').length;

    if (aliveMafia === 0) {
      data.phase = 'game_over';
      data.winner = 'TOWN';
      data.winner_title = 'ПОБЕДА ГОРОДА';
      data.messages.push({
        id: 'sys_win_' + Date.now(),
        sender_id: 'system',
        sender_seat: 0,
        sender_name: 'MAFIRO',
        text: `🏆 ВСЯ МАФИЯ УНИЧТОЖЕНА! ГОРОД ПОБЕДИЛ!`,
        channel: 'system',
        timestamp: Date.now() / 1000,
        is_system: true
      });
      return true;
    }

    if (aliveMafia >= aliveTown) {
      data.phase = 'game_over';
      data.winner = 'MAFIA';
      data.winner_title = 'ПОБЕДА СИНДИКАТА';
      data.messages.push({
        id: 'sys_win_' + Date.now(),
        sender_id: 'system',
        sender_seat: 0,
        sender_name: 'MAFIRO',
        text: `🎩 СИНДИКАТ ЗАХВАТИЛ ГОРОД! ПОБЕДА МАФИИ!`,
        channel: 'system',
        timestamp: Date.now() / 1000,
        is_system: true
      });
      return true;
    }

    return false;
  }
}

export const localGameEngine = new LocalGameEngine();
