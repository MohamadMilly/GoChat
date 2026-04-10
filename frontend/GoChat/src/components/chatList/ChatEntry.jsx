import { printGroupTypingUsers } from "../../utils/printGroupTypingUsers";
import { Avatar } from "../chat/Avatar";
import { NavLink } from "react-router";
import { memo, useEffect, useState } from "react";
import { socket } from "../../socket";
import { ChatBubbleStatus } from "../chat/chatBubbleStatus";
import { useAuth } from "../../contexts/AuthContext";

export const ChatEntry = memo(
  ({
    chatAvatar,
    isGroup,
    chatTitle,
    lastMessage = null,
    isConnected,
    typingUsers,
    conversationId,
    color,
  }) => {
    const base_class =
      "w-full flex items-center gap-x-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150";
    const readers = lastMessage.readers
      ? lastMessage.readers.map((reader) => reader.readerId)
      : [];

    return (
      <li>
        <NavLink
          viewTransition
          to={`/chats/${isGroup ? "group" : "direct"}/${conversationId}`}
          className={({ isActive, isPending }) => {
            if (isActive) {
              return `${base_class} bg-cyan-600/40 dark:bg-cyan-400/40`;
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
                className={`absolute w-3 h-3 bottom-0 right-0 rounded-full ${isConnected ? "bg-cyan-600 dark:bg-cyan-300" : "bg-gray-400 dark:bg-gray-500"}`}
              ></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-x-2">
              <strong className="text-gray-800 dark:text-gray-50 truncate">
                {chatTitle}
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {lastMessage?.createdAt
                  ? new Date(lastMessage.createdAt).toLocaleTimeString()
                  : ""}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm text-left mt-1 flex items-center justify-between">
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
              {lastMessage && (
                <ChatBubbleStatus
                  readers={readers}
                  senderId={lastMessage?.sender?.id || lastMessage.senderId}
                  status={lastMessage.status}
                  className={"shrink-0"}
                  supportNotifications={true}
                />
              )}
            </div>
          </div>
        </NavLink>
      </li>
    );
  },
);
