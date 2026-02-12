import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import { socket } from "../../socket";
import { Fragment, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function MessagesList({ messages, type }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("this runs");
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
      socket.auth.serverOffset = {
        ...socket.auth.serverOffset,
        [conversationId]: serverOffset,
      };
    }

    socket.on("chat message", onReceiveMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
    };
  }, [queryClient, user.id]);

  return (
    <ul className="p-1 flex-1">
      {messages.map((message, index) => {
        const previousMessageDate = messages[index - 1]
          ? messages[index - 1].createdAt
          : null;

        const isNewDayMessage = previousMessageDate
          ? new Date(message.createdAt).getDate() !=
            new Date(previousMessageDate).getDate()
          : true;

        const sender = message.sender;
        const isMyMessage = user.id === sender.id;

        return (
          <Fragment key={message.id}>
            {isNewDayMessage && (
              <span
                dir="rtl"
                className="text-xs text-gray-500 bg-gray-50/40 mx-auto my-2 block w-fit p-0.5 rounded"
              >
                {new Date(message.createdAt).toLocaleDateString()}
              </span>
            )}
            <ChatBubble
              message={message}
              isGroupMessage={type === "GROUP"}
              isMyMessage={isMyMessage}
            />
          </Fragment>
        );
      })}
    </ul>
  );
}
