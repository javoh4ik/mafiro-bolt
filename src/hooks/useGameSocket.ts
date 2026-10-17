import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameStatePayload, ChatChannel, ThrowableItem } from '../types/game';
import { localGameEngine } from '../utils/localGameEngine';

interface UseGameSocketProps {
  roomId: string;
  userId: string;
  username: string;
  firstName: string;
  avatarUrl?: string;
  priorityRole?: string;
  hasShield?: boolean;
}

export function useGameSocket({
  roomId,
  userId,
  username,
  firstName,
  avatarUrl,
  priorityRole,
  hasShield
}: UseGameSocketProps) {
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const fallbackUnsubRef = useRef<(() => void) | null>(null);

  // Store mutable user metadata in a ref so changes don't trigger socket teardown/reconnect loops
  const userParamsRef = useRef({ username, firstName, avatarUrl, priorityRole, hasShield });
  useEffect(() => {
    userParamsRef.current = { username, firstName, avatarUrl, priorityRole, hasShield };
  }, [username, firstName, avatarUrl, priorityRole, hasShield]);

  // Activate local browser engine fallback
  const activateLocalFallback = useCallback(() => {
    if (!roomId || !userId) return;
    setIsLocalFallback(true);
    setIsConnected(true);

    const params = userParamsRef.current;
    localGameEngine.joinRoom(roomId, {
      id: userId,
      username: params.username,
      first_name: params.firstName,
      avatar_url: params.avatarUrl
    });

    if (fallbackUnsubRef.current) {
      fallbackUnsubRef.current();
    }
    fallbackUnsubRef.current = localGameEngine.subscribe(roomId, userId, (state) => {
      setGameState(state);
    });
  }, [roomId, userId]);

  const connect = useCallback(() => {
    if (!roomId || !userId) return;

    // Guard: Do not reconnect if already open or connecting to this room
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${roomId}/${userId}`;

    let socketOpened = false;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;
    } catch {
      // Direct failure -> fallback immediately
      activateLocalFallback();
      return;
    }

    // Fallback timer: if WebSocket does not connect within 1.5 seconds, use local engine
    const fallbackTimer = window.setTimeout(() => {
      if (!socketOpened) {
        try {
          if (ws) ws.close();
        } catch {}
        activateLocalFallback();
      }
    }, 1500);

    ws.onopen = () => {
      socketOpened = true;
      clearTimeout(fallbackTimer);
      setIsConnected(true);
      setIsLocalFallback(false);

      const params = userParamsRef.current;
      ws?.send(JSON.stringify({
        type: 'join',
        username: params.username,
        first_name: params.firstName,
        avatar_url: params.avatarUrl,
        priority_role: params.priorityRole,
        has_first_night_shield: params.hasShield
      }));
    };

    ws.onmessage = (event) => {
      try {
        const payload: GameStatePayload = JSON.parse(event.data);
        setGameState(payload);
      } catch (err) {
        console.error('Error parsing game state', err);
      }
    };

    ws.onclose = () => {
      clearTimeout(fallbackTimer);
      if (!socketOpened) {
        // Never succeeded in opening -> fallback
        activateLocalFallback();
      } else {
        setIsConnected(false);
        socketRef.current = null;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      clearTimeout(fallbackTimer);
      if (!socketOpened) {
        activateLocalFallback();
      }
    };
  }, [roomId, userId, activateLocalFallback]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (fallbackUnsubRef.current) {
        fallbackUnsubRef.current();
        fallbackUnsubRef.current = null;
      }
      if (socketRef.current) {
        try {
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'leave' }));
          }
        } catch {}
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const send = (type: string, data: Record<string, any> = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...data }));
    }
  };

  const sendAction = (targetSeat: number) => {
    if (isLocalFallback) {
      localGameEngine.sendAction(roomId, userId, targetSeat);
    } else {
      send('action', { target_seat: targetSeat });
    }
  };

  const clearAction = () => {
    if (isLocalFallback) {
      localGameEngine.clearAction(roomId, userId);
    } else {
      send('clear_action');
    }
  };

  const sendChat = (text: string, channel: ChatChannel = 'public') => {
    if (!text.trim()) return;
    if (isLocalFallback) {
      localGameEngine.sendChat(roomId, userId, text, channel);
    } else {
      send('chat', { text, channel });
    }
  };

  const throwItem = (targetSeat: number, item: ThrowableItem) => {
    if (isLocalFallback) {
      const mySeat = gameState?.me?.seat_number || 1;
      localGameEngine.throwItem(roomId, mySeat, targetSeat, item);
    } else {
      send('throw', { target_seat: targetSeat, item });
    }
  };

  const startGame = () => {
    if (isLocalFallback) {
      localGameEngine.startGame(roomId);
    } else {
      send('start_game');
    }
  };

  const fillBots = () => {
    if (isLocalFallback) {
      localGameEngine.startGame(roomId);
    } else {
      send('fill_bots');
    }
  };

  const leaveRoom = () => {
    if (isLocalFallback) {
      localGameEngine.leaveRoom(roomId, userId);
    } else {
      send('leave');
    }
  };

  return {
    gameState,
    isConnected,
    isLocalFallback,
    sendAction,
    clearAction,
    sendChat,
    throwItem,
    startGame,
    fillBots,
    leaveRoom
  };
}
