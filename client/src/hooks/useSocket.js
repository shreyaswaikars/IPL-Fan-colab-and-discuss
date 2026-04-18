import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = window.location.origin;

export function useSocket(matchId, fan) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState({ fans: [], messages: [], reactions: {}, aiCommentary: [] });

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (matchId && fan) {
        socket.emit('join-room', { matchId, fan });
      }
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('room-state', (state) => {
      setRoomState(state);
    });

    socket.on('room-update', ({ fans }) => {
      setRoomState((prev) => ({ ...prev, fans }));
    });

    socket.on('fan-joined', ({ fan: newFan }) => {
      setRoomState((prev) => {
        const exists = prev.fans.find((f) => f.id === newFan.id);
        return exists ? prev : { ...prev, fans: [...prev.fans, newFan] };
      });
    });

    socket.on('fan-left', ({ fan: leftFan }) => {
      if (!leftFan) return;
      setRoomState((prev) => ({ ...prev, fans: prev.fans.filter((f) => f.id !== leftFan.id) }));
    });

    socket.on('new-message', (msg) => {
      setRoomState((prev) => ({
        ...prev,
        messages: [...prev.messages.slice(-199), msg],
      }));
    });

    socket.on('reaction-update', ({ eventId, emoji, counts }) => {
      setRoomState((prev) => ({
        ...prev,
        reactions: { ...prev.reactions, [eventId]: counts },
      }));
    });

    socket.on('ai-commentary', (item) => {
      setRoomState((prev) => ({
        ...prev,
        aiCommentary: [...prev.aiCommentary.slice(-19), item],
      }));
    });

    return () => socket.disconnect();
  }, [matchId, fan?.id]);

  const sendMessage = useCallback((message) => {
    socketRef.current?.emit('send-message', { matchId, message });
  }, [matchId]);

  const sendReaction = useCallback((emoji, eventId = 'general') => {
    socketRef.current?.emit('send-reaction', { matchId, eventId, emoji });
  }, [matchId]);

  const triggerAiEvent = useCallback((event, matchContext) => {
    socketRef.current?.emit('trigger-ai-event', { matchId, event, matchContext });
  }, [matchId]);

  return { connected, roomState, sendMessage, sendReaction, triggerAiEvent };
}
