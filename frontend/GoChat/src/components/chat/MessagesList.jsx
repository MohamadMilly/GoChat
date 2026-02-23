import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import { Fragment, useCallback, useContext, useEffect, useRef } from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useMessages } from "../../hooks/useMessages";
import { MessagesListLoading } from "../skeletonLoadingComponents/MessagesListLoading";
import { getLatestUnReadMessages } from "../../utils/getLatestUnReadMessages";

export function MessagesList({ convId = null }) {
  const { user } = useAuth();
  const messagesListRef = useRef(null);

  const { conversationId } = useContext(ChatPageContext);
  const {
    messages,
    type,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(conversationId || convId);

  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [messages]);

  const [unreadMessagesCount, lastUnReadMessageIndex] = getLatestUnReadMessages(
    user.id,
    messages,
  );

  if (isFetchingMessages) return <MessagesListLoading />;
  if (messagesError) return <p>Error: {messagesError.message}</p>;
  return (
    <ul
      ref={messagesListRef}
      className="flex-1 p-1 h-full overflow-visible overflow-y-auto overflow-x-hidden z-10 scrollbar-custom"
    >
      {messages && messages.length === 0 ? (
        <p
          className="text-center text-lg h-full flex justify-center items-center text-gray-800 z-10
            "
        >
          No messages yet.
        </p>
      ) : (
        messages.map((message, index) => {
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
              {lastUnReadMessageIndex + 1 === index &&
                unreadMessagesCount !== 0 && (
                  <span
                    dir="rtl"
                    className="text-xs text-gray-500 bg-gray-50/40 mx-auto my-2 block w-fit p-0.5 rounded"
                  >
                    Unread messages {unreadMessagesCount}
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
        })
      )}
    </ul>
  );
}
