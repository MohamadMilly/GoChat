import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
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
    function onUserTyping(userId, conversationId) {
      setTypingUsers((prev) =>
        prev.some(
          (typingUser) =>
            typingUser.userId === userId &&
            conversationId === typingUser.conversationId,
        )
          ? prev
          : [...prev, { userId: userId, conversationId: conversationId }],
      );
    }
    function onUserStoppedTyping(userId) {
      setTypingUsers((prev) =>
        prev.filter((typingUser) => typingUser.userId !== userId),
      );
    }

    function onReceiveMessage(message, conversationId) {
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((conversation) => {
            if (conversation.id == conversationId) {
              return {
                ...conversation,
                messages: [message],
              };
            }
            return conversation;
          }),
        };
      });
    }
    socket.on("chat message", onReceiveMessage);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user connected", onUserConnect);
    socket.on("user disconnected", onUserDisconnect);
    socket.on("typing", onUserTyping);
    socket.on("stopped typing", onUserStoppedTyping);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user connected", onUserConnect);
      socket.off("user disconnected", onUserDisconnect);
      socket.off("typing", onUserTyping);
      socket.off("stopped typing", onUserStoppedTyping);
      socket.off("chat message", onReceiveMessage);
    };
  }, []);
  return (
    <SocketContext.Provider
      value={{ isConnected, connectedUsers, typingUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
