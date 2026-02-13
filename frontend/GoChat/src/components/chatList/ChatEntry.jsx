import { Check, CheckCheck, Clock } from "lucide-react";
import { printGroupTypingUsers } from "../../utils/printGroupTypingUsers";
import { Avatar } from "../chat/Avatar";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useAuth } from "../../contexts/AuthContext";
export function ChatEntry({
  chatAvatar,
  isGroup,
  chatTitle,
  lastMessage = "",
  onOpenChat,
  isConnected,
  typingUsers,
  conversationId,
  color,
}) {
  const { user } = useAuth();
  const base_class =
    "w-full flex items-center gap-x-3 p-3 hover:bg-gray-50 transition-colors duration-150";
  const initialReadStatus = lastMessage.readers
    ? lastMessage.readers.length > 0
      ? true
      : false
    : null;
  const [isRead, setIsRead] = useState(initialReadStatus);
  const [notifications, setNotifications] = useState(0);
  useEffect(() => {
    setIsRead(lastMessage.readers?.length > 0 ? true : false);
  }, [lastMessage]);
  useEffect(() => {
    function onReadMessage(messageId, readerId) {
      if (messageId === lastMessage.id && lastMessage.senderId !== readerId) {
        setIsRead(true);
        if (readerId !== user.id) {
          setNotifications((prev) => prev + 1);
        }
      }
    }

    socket.on("read message", onReadMessage);

    return () => socket.off("read message", onReadMessage);
  });
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
                <span className="truncate">{lastMessage?.content || ""}</span>
              )}
              <span className="shrink-0">
                {lastMessage.status === "pending" ? (
                  <Clock size={12} />
                ) : isRead ? (
                  <CheckCheck size={12} />
                ) : (
                  <Check size={12} />
                )}
              </span>
            </p>
          </div>
        </NavLink>
      </button>
    </li>
  );
}
