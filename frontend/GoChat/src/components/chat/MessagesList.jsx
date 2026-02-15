import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import { socket } from "../../socket";
import { Fragment, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function MessagesList({ messages, type, ref }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return (
    <ul
      ref={ref}
      className="p-1 h-full overflow-visible overflow-y-auto z-10 relative scrollbar-custom"
    >
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

        const isThereNextMessageFromTheSameUser =
          messages[index + 1]?.senderId === message.senderId;
        const isTherePreviousMessageFromTheSameuser =
          messages[index - 1]?.senderId === message.senderId;
        return (
          <Fragment key={message.id || message.createdAt}>
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
              hideAvatar={isThereNextMessageFromTheSameUser}
              hideName={isTherePreviousMessageFromTheSameuser}
            />
          </Fragment>
        );
      })}
    </ul>
  );
}
