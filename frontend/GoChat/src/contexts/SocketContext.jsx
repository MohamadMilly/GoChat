import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { token, user } = useAuth();
  useEffect(() => {
    if (!token || !user) return;
    socket.connect();
    socket.emit("user connected", user.id);
    return () => socket.disconnect();
  }, [token, user]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }
    function onUserConnect(users) {
      setConnectedUsers(users);
    }
    function onUserDisconnect(userId) {
      setConnectedUsers((prev) => prev.filter((id) => id != userId));
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user connected", onUserConnect);
    socket.on("user disconnected", onUserDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user connected", onUserConnect);
      socket.off("user disconnected", onUserDisconnect);
    };
  }, []);
  return (
    <SocketContext.Provider value={{ isConnected, connectedUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
