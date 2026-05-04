import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        autoConnect: false,
      }),
    []
  );

  useEffect(() => {
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
