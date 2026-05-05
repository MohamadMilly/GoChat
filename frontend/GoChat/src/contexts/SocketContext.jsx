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
      if (!socket.recovered) {
        const offsets = socket.auth.serverOffset;
        socket.emit("recover", offsets);
        socket.emit("user connected", user.id);
      }
      setIsConnected(true);
    }

    function onDisconnect(reason) {
      setIsConnected(false);
      if (reason === "io server disconnect") {
        socket.connect();
      }
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
          if (!old?.pages) {
            return old;
          }

          if (message.sender.id === user.id) {
            /* if there is a message with the same date as the received one (the optmiticMessageCreatedAt value) replace it 
              if not , then the user probably using two desvices , then just add it
            */
            const checkSameDate = (date1, date2) => {
              const d1 = new Date(date1);
              const d2 = new Date(date2);
              return d1.getTime() === d2.getTime();
            };
            const existingOptimsticMessage = old.pages.some((page) =>
              page.messages.some((message) =>
                checkSameDate(message.createdAt, optimisticMessageCreatedAt),
              ),
            );
            if (existingOptimsticMessage) {
              return {
                ...old,
                pages: old.pages.map((page, index) => {
                  if (index === 0) {
                    return {
                      ...page,
                      messages: page.messages.map((m) => {
                        const d1 = new Date(m.createdAt);
                        const d2 = new Date(optimisticMessageCreatedAt);

                        if (d1.getTime() === d2.getTime()) {
                          return message;
                        } else return m;
                      }),
                    };
                  } else {
                    return page;
                  }
                }),
                /* messages: old.messages.map((m) => {
                  const d1 = new Date(m.createdAt);
                  const d2 = new Date(optimisticMessageCreatedAt);

                  if (d1.getTime() === d2.getTime()) {
                    return message;
                  } else return m;
                }),*/
              };
            } else {
              return {
                ...old,
                pages: old.pages.map((page, index) => {
                  if (index === 0) {
                    return {
                      ...page,
                      messages: [...page.messages, message],
                    };
                  } else {
                    return page;
                  }
                }),
              };
            }
          }
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  messages: [...page.messages, message],
                };
              } else {
                return page;
              }
            }),
          };
        },
      );

      /* Whenever a message receieved , an effect will be triggered */
      const chatBubbleAudio = new Audio("/sounds/chatBubble_soundeffect.mp3");
      chatBubbleAudio.play().catch((error) => {
        console.error("Error playing audio: ", error);
      });
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
          if (!old?.pages) return old;

          const updatedPages = old.pages.map((page) => ({
            ...page,
            messages: page.messages.filter(
              (message) => message.id !== messageId,
            ),
          }));

          newMessages = updatedPages.flatMap((page) => page.messages);

          return {
            ...old,
            pages: updatedPages,
          };
        },
      );

      queryClient.setQueryData(["conversations"], (old) => {
        if (!old.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == conversationId && c.messages[0]?.id === messageId) {
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
          if (!old?.pages) return old;

          const updatedPages = old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((message) => {
              if (message.id === editedMessage.id) {
                return editedMessage;
              }
              return message;
            }),
          }));

          newMessages = updatedPages.flatMap((page) => page.messages);

          return {
            ...old,
            pages: updatedPages,
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

    function onRecieveBlock(userId, conversationId) {
      const updateParticipants = (participants) =>
        participants.map((p) =>
          p.userId === userId
            ? { ...p, user: { ...p.user, profile: null } }
            : p,
        );
      queryClient.setQueryData(
        ["conversation", conversationId.toString()],
        (old) => {
          if (!old?.conversation) return old;
          return {
            ...old,
            conversation: {
              ...old.conversation,
              participants: updateParticipants(old.conversation.participants),
            },
          };
        },
      );

      queryClient.setQueryData(["conversations"], (old) => {
        if (!old?.conversations) return old;
        console.log(old);
        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == conversationId) {
              return {
                ...c,
                participants: updateParticipants(c.participants),
              };
            }
            return c;
          }),
        };
      });
      queryClient.setQueryData(["user", userId.toString()], (old) => {
        if (!old?.user) return old;
        return {
          ...old,
          isBlocking: true,
          user: {
            ...old.user,
            profile: null,
          },
        };
      });
    }
    function onReceiveUnBlock(userId, conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["user", userId.toString()],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });
    }
    function onEditPermissions(conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "permissions"],
        exact: true,
      });
    }
    function onCreateConversation() {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
        exact: true,
      });
    }

    function onEditConversation(withJoin, conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId.toString()],
        exact: true,
      });
      if (withJoin) {
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
          exact: true,
        });
      }
    }
    function onJoinConversation(conversationId, fullname) {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });
    }
    function onLeaveConversation(withDelete, fullname, userId, conversationId) {
      if (withDelete) {
        queryClient.setQueryData(["conversations"], (old) => {
          if (!old?.conversations) return old;
          return {
            ...old,
            conversations: old.conversations.filter(
              (c) => c.id != conversationId,
            ),
          };
        });
      } else {
        /* update conversation data */
        queryClient.setQueryData(["conversation", conversationId], (old) => {
          if (!old?.conversation) return old;
          return {
            ...old,
            membersCount: old.membersCount - 1,
            conversation: {
              ...old.conversation,
              participants: old.conversation.participants.filter(
                (p) => p.userId != userId,
              ),
            },
          };
        });
      }
    }

    function onReadMessage(conversationId, messageId, userId) {
      if (!conversationId || !messageId || !userId) return;
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((message) => {
                const previousReaders = message?.readers || [];
                if (message.id == messageId && userId !== user.id) {
                  return {
                    ...message,
                    readers: [...previousReaders, { id: userId }],
                  };
                } else {
                  return message;
                }
              }),
            })),
          };
        },
      );

      queryClient.setQueryData(["conversations"], (old) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == conversationId) {
              const readMessage = c.messages.find((m) => m.id == messageId);
              if (!readMessage) {
                return c;
              } else {
                return {
                  ...c,
                  messages: [
                    {
                      ...readMessage,
                      readers:
                        userId == user.id && readMessage.senderId == user.id
                          ? readMessage.readers
                          : [...(readMessage.readers || []), { id: userId }],
                    },
                  ],
                };
              }
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
    socket.on("read message", onReadMessage);
    socket.on("block user", onRecieveBlock);
    socket.on("unblock user", onReceiveUnBlock);
    socket.on("edit permissions", onEditPermissions);
    socket.on("edit conversation", onEditConversation);
    socket.on("create conversation", onCreateConversation);
    socket.on("join conversation", onJoinConversation);
    socket.on("leave conversation", onLeaveConversation);

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
      socket.off("read message", onReadMessage);
      socket.off("block user", onRecieveBlock);
      socket.off("unblock user", onReceiveUnBlock);
      socket.off("edit permissions", onEditPermissions);
      socket.off("edit conversation", onEditConversation);
      socket.off("create conversation", onCreateConversation);
      socket.off("join conversation", onJoinConversation);
      socket.off("leave conversation", onLeaveConversation);
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
