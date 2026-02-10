import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import { socket } from "../../socket";
import { useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatPageContext } from "../../routes/ChatPage";

export function MessagesList({ messages, type }) {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  useEffect(() => {
    function onReceiveMessage(message, conversationId, serverOffset) {
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          // if there is no previous cached data return the old data , or if it the user's message don't added because it is now optimistic
          if (!old?.messages || !old?.type || message.senderId === user.id)
            return old;

          return {
            ...old,
            messages: [...old.messages, message],
          };
        },
      );
      socket.auth.serverOffset = serverOffset;
    }

    socket.on("chat message", onReceiveMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
    };
  }, [queryClient]);
  return (
    <ul className="p-1 flex-1">
      {messages.map((message) => {
        const sender = message.sender;
        const isMyMessage = user.id === sender.id;
        return (
          <ChatBubble
            message={message}
            isGroupMessage={type === "GROUP"}
            isMyMessage={isMyMessage}
            key={message.id}
          />
        );
      })}
    </ul>
  );
}
