import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();

  const socket = useMemo(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

    if (!socketUrl) {
      console.error("Missing VITE_SOCKET_URL. Realtime seat updates will be disabled until it is configured.");
      return null;
    }

    return io(socketUrl.replace(/\/+$/, ""), {
      autoConnect: false,
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (user) socket.connect();
    else socket.disconnect();

    return () => {
      socket.disconnect();
    };
  }, [socket, user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
