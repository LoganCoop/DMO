import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomCode: string) => void;
  leaveRoom: (roomCode: string) => void;
  sendMessage: (message: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const joinRoom = (roomCode: string) => {
    if (socket) {
      socket.emit('join-room', roomCode);
    }
  };

  const leaveRoom = (roomCode: string) => {
    if (socket) {
      socket.emit('leave-room', roomCode);
    }
  };

  const sendMessage = (message: any) => {
    if (socket) {
      socket.emit('game-message', message);
    }
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
};