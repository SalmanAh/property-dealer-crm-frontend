'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connectionListeners: ((connected: boolean) => void)[] = [];
let eventListeners: Map<string, ((data: any) => void)[]> = new Map();

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // ── Connection/Disconnection Handlers ──────────────────
    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket?.id);
      notifyConnectionListeners(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      notifyConnectionListeners(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error);
    });

    socket.on('reconnect_attempt', () => {
      console.log('[Socket.io] Attempting to reconnect...');
    });

    socket.on('reconnect', () => {
      console.log('[Socket.io] Reconnected');
      notifyConnectionListeners(true);
    });

    // ── Event Listeners for Lead Updates ───────────────────
    socket.on('lead:new', (lead) => {
      console.log('[Socket.io] New lead:', lead);
      emitToListeners('lead:new', lead);
    });

    socket.on('lead:assigned', (lead) => {
      console.log('[Socket.io] Lead assigned:', lead);
      emitToListeners('lead:assigned', lead);
    });

    socket.on('lead:updated', (lead) => {
      console.log('[Socket.io] Lead updated:', lead);
      emitToListeners('lead:updated', lead);
    });

    socket.on('lead:status_changed', (lead) => {
      console.log('[Socket.io] Lead status changed:', lead);
      emitToListeners('lead:status_changed', lead);
    });

    socket.on('lead:deleted', (data) => {
      console.log('[Socket.io] Lead deleted:', data);
      emitToListeners('lead:deleted', data);
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join', userId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// ── Connection Status Listeners ────────────────────────
export const onConnectionChange = (callback: (connected: boolean) => void) => {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
};

const notifyConnectionListeners = (connected: boolean) => {
  connectionListeners.forEach((cb) => cb(connected));
};

// ── Event Listeners ────────────────────────────────────
export const onSocketEvent = (event: string, callback: (data: any) => void) => {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }
  eventListeners.get(event)!.push(callback);

  return () => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
};

const emitToListeners = (event: string, data: any) => {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((cb) => cb(data));
  }
};

// ── Connection Status ──────────────────────────────────
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

export default getSocket;
