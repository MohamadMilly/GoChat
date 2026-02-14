import { printGroupTypingUsers } from "../../utils/printGroupTypingUsers";
import { Avatar } from "../chat/Avatar";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { ChatBubbleStatus } from "../chat/chatBubbleStatus";

export function ChatEntry({
  chatAvatar,
  isGroup,
  chatTitle,
  lastMessage = null,
  onOpenChat,
  isConnected,
  typingUsers,
  conversationId,
  color,
}) {
  const base_class =
    "w-full flex items-center gap-x-3 p-3 hover:bg-gray-50 transition-colors duration-150";
  const initialReadersIds = lastMessage.readers
    ? lastMessage.readers.map((reader) => reader.readerId)
    : [];
  const [readers, setReaders] = useState(initialReadersIds);

  useEffect(() => {
    function onReadMessage(messageId, readerId) {
      console.log(chatTitle, messageId, lastMessage.id);
      if (messageId === lastMessage?.id) {
        setReaders((prev) => [...prev, readerId]);
      }
    }

    socket.on("read message", onReadMessage);

    return () => socket.off("read message", onReadMessage);
  });
  // reset the state when a new message arrives
  useEffect(() => {
    if (!lastMessage) return;
    setReaders(
      lastMessage?.readers
        ? lastMessage.readers.map((reader) => reader.readerId)
        : [],
    );
  }, [lastMessage]);
  return (
    <li>
      <button className="w-full" onClick={onOpenChat}>
        <NavLink
          viewTransition
          to={`/chats/${conversationId}`}
          className={({ isActive, isPending }) => {
            if (isActive) {
              return `${base_class} bg-cyan-600/40`;
            }
            if (isPending) {
              return `${base_class} bg-gray-100`;
            }
            return base_class;
          }}
        >
          <div className="shrink-0 relative">
            <Avatar avatar={chatAvatar} chatTitle={chatTitle} color={color} />
            {!isGroup && (
              <span
                className={`absolute w-3 h-3 bottom-0 right-0 rounded-full ${isConnected ? "bg-cyan-600" : "bg-gray-400"}`}
              ></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-x-2">
              <strong className="text-gray-900 truncate">{chatTitle}</strong>
              <span className="text-xs text-gray-400">
                {lastMessage?.createdAt
                  ? new Date(lastMessage.createdAt).toLocaleTimeString()
                  : ""}
              </span>
            </div>
            <p className="text-gray-600 text-sm  text-left mt-1 flex items-center justify-between">
              {typingUsers.length > 0 ? (
                isGroup ? (
                  <span className="truncate">
                    {printGroupTypingUsers(typingUsers)}
                  </span>
                ) : (
                  <span>typing...</span>
                )
              ) : (
                <span className="truncate">
                  {lastMessage ? lastMessage.content : ""}
                </span>
              )}
              <ChatBubbleStatus
                readers={readers}
                senderId={lastMessage?.sender?.id || lastMessage.senderId}
                status={lastMessage.status}
              />
            </p>
          </div>
        </NavLink>
      </button>
    </li>
  );
}
