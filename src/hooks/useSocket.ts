import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string = window.location.origin) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  return socketRef.current;
};
