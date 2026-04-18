import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socket = null;

export function useSocket() {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current) {
      socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
      socket.emit('user:online', user._id);
      initialized.current = true;
    }
    return () => {
      if (!user && socket) { socket.disconnect(); socket = null; initialized.current = false; }
    };
  }, [user]);

  return socket;
}

export function getSocket() { return socket; }
