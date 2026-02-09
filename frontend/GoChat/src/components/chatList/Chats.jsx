import { ChatEntry } from "./ChatEntry";
import { useSocket } from "../../contexts/SocketContext";
import { getTypingUsers } from "../../utils/getTypingUsers";
import { useAuth } from "../../contexts/AuthContext";
import { getChatInfo } from "../../utils/getChatInfo";
import { getConnectedUsers } from "../../utils/getConnectedUsers";

export function Chats({ chatsEntries }) {
  const { user } = useAuth();
  const { connectedUsers, typingUsers } = useSocket();
  return (
    <section className="px-2 pt-2 max-h-full">
      <ul className="divide-y divide-gray-100 overflow-y-auto scrollbar-custom h-[calc(100vh-200px)]">
        {chatsEntries.map((chatEntry) => {
          const { chatAvatar, lastMessage, chatTitle, isGroup, color } =
            getChatInfo(chatEntry, user.id);
          const thisChatConnectedUsers = getConnectedUsers(
            chatEntry.participants,
            connectedUsers,
          );
          const isoneToOneChatPartnerConnected = thisChatConnectedUsers.some(
            (c) => c.userId !== user.id,
          );
          const thisChatTypingUsers = getTypingUsers(
            chatEntry.participants,
            typingUsers,
            chatEntry.id,
          );
          return (
            <ChatEntry
              key={chatEntry.id}
              lastMessage={lastMessage}
              chatTitle={chatTitle}
              isGroup={isGroup}
              chatAvatar={chatAvatar}
              conversationId={chatEntry.id}
              isConnected={isGroup ? null : isoneToOneChatPartnerConnected}
              typingUsers={thisChatTypingUsers}
              color={color}
            />
          );
        })}
      </ul>
    </section>
  );
}
