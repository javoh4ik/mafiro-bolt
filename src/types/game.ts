export type Role = 
  | 'don' 
  | 'mafia' 
  | 'sheriff' 
  | 'doctor' 
  | 'mistress' 
  | 'maniac' 
  | 'citizen';

export type Team = 'mafia' | 'town' | 'maniac';

export type Phase = 
  | 'lobby' 
  | 'night' 
  | 'day' 
  | 'vote' 
  | 'last_word' 
  | 'game_over';

export type ChatChannel = 'public' | 'syndicate' | 'ghost' | 'system';

export type ThrowableItem = 'tomato' | 'clown' | 'rose' | 'loupe';

export interface PublicPlayer {
  id: string;
  seat_number: intNumber;
  username: string;
  first_name: string;
  avatar_url?: string;
  is_bot: boolean;
  is_alive: boolean;
  role?: Role;
  role_title?: string;
  role_icon?: string;
  votes_received: number;
  voted_for_seat?: number;
  is_speaking?: boolean;
}

export type intNumber = number;

export interface TeammateInfo {
  seat_number: number;
  first_name: string;
  role_title: string;
  is_alive: boolean;
}

export interface InspectionResult {
  inspected_seat?: number;
  inspected_result?: string;
}

export interface PrivatePlayerState {
  id: string;
  seat_number: number;
  role: Role;
  role_title: string;
  role_icon: string;
  role_team: string;
  role_description: string;
  is_alive: boolean;
  is_blocked: boolean;
  can_act: boolean;
  teammates: TeammateInfo[];
  inspection_result?: InspectionResult;
  has_first_night_shield: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_seat: number;
  sender_name: string;
  text: string;
  channel: ChatChannel;
  timestamp: number;
  is_system: boolean;
}

export interface TargetVector {
  from_seat: number;
  to_seat: number;
}

export interface ThrowableEvent {
  from_seat: number;
  to_seat: number;
  item: ThrowableItem;
  timestamp: number;
}

export interface GameStatePayload {
  room_id: string;
  room_name: string;
  host_id: string;
  phase: Phase;
  phase_time_left: number;
  day_number: number;
  max_players: number;
  players: PublicPlayer[];
  me?: PrivatePlayerState;
  messages: ChatMessage[];
  active_targets: TargetVector[];
  last_throwable?: ThrowableEvent;
  winner?: 'MAFIA' | 'TOWN' | 'MANIAC' | string;
  winner_title?: string;
  eliminated_player?: PublicPlayer;
}

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  avatar_url?: string;
  mmr: number;
  bucks: number;
  stars: number;
  games_played: number;
  games_won: number;
  inventory: string[];
}

export interface ShopItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  stars_price: number;
  bucks_price: number;
}

export interface RoomSummary {
  room_id: string;
  name: string;
  host_id: string;
  player_count: number;
  max_players: number;
  phase: string;
  is_blitz: boolean;
}
