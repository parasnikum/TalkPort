import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
const WS_URL = import.meta.env.VITE_WS_URL;


interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Replace with your actual socket server URL
    const socket = io(WS_URL, {
      autoConnect: false,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to socket server');

    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from socket server');
    });

    socket.connect();
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};