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

    function onReceiveMessage(
      message,
      conversationId,
      serverOffset,
      optimisticMessageCreatedAt,
    ) {
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
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          // if there is no previous cached data return the old data , or if it the user's message don't added because it is now optimistic
          if (!old?.messages || !old?.type) {
            return old;
          }

          if (message.sender.id === user.id) {
            return {
              ...old,
              messages: old.messages.map((m) => {
                const d1 = new Date(m.createdAt);
                const d2 = new Date(optimisticMessageCreatedAt);

                if (d1.getTime() === d2.getTime()) {
                  return message;
                } else return m;
              }),
            };
          }
          return {
            ...old,
            messages: [...old.messages, message],
          };
        },
      );
      socket.auth.serverOffset = {
        ...socket.auth.serverOffset,
        [conversationId]: serverOffset,
      };
    }
    function onDeleteMessage(messageId, conversationId) {
      let newMessages;
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          if (!old.messages) return old;
          newMessages = old.messages.filter(
            (message) => message.id !== messageId,
          );
          return {
            ...old,
            messages: newMessages,
          };
        },
      );
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == conversationId && c.messages[0].id === messageId) {
              return { ...c, messages: [newMessages[newMessages.length - 1]] };
            } else {
              return c;
            }
          }),
        };
      });
    }

    function onEditMessage(editedMessage, conversationId) {
      let newMessages = [];
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          if (!old.messages) return old;
          newMessages = old.messages.map((message) => {
            if (message.id === editedMessage.id) {
              return editedMessage;
            }
            return message;
          });
          return {
            ...old,
            messages: newMessages,
          };
        },
      );
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (
              c.id == conversationId &&
              c.messages[0].id === editedMessage.id
            ) {
              return { ...c, messages: [newMessages[newMessages.length - 1]] };
            } else {
              return c;
            }
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
    socket.on("delete message", onDeleteMessage);
    socket.on("edit message", onEditMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user connected", onUserConnect);
      socket.off("user disconnected", onUserDisconnect);
      socket.off("typing", onUserTyping);
      socket.off("stopped typing", onUserStoppedTyping);
      socket.off("delete message", onDeleteMessage);
      socket.off("edit message", onEditMessage);
    };
  }, [queryClient, user]);
  return (
    <SocketContext.Provider
      value={{ isConnected, connectedUsers, typingUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
