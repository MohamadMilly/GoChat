import { useNavigate } from "react-router";
import { ChatEntry } from "./ChatEntry";
import { useSocket } from "../../contexts/SocketContext";

export function Chats({ chatsEntries }) {
  const navigate = useNavigate();
  const { connectedUsers } = useSocket();
  return (
    <section className="px-2 pt-2">
      <ul className="divide-y divide-gray-100 overflow-auto h-[calc(100vh-160px)]">
        {chatsEntries.map((chatEntry) => {
          const isGroup = chatEntry.type === "GROUP";

          const chatAvatar = isGroup
            ? chatEntry.avatar
            : chatEntry.participants[0].user?.profile.avatar || "";

          const lastMessage = chatEntry.messages[0];
          const chatTitle = isGroup
            ? chatEntry.title
            : chatEntry.participants[0].user.firstname +
              " " +
              chatEntry.participants[0].user.lastname;

          const isConnected = !!connectedUsers.find(
            (id) => id == chatEntry.participants[0].user.id,
          );
          return (
            <ChatEntry
              key={chatEntry.id}
              lastMessage={lastMessage}
              chatTitle={chatTitle}
              isGroup={isGroup}
              chatAvatar={chatAvatar}
              onOpenChat={() => {
                navigate(`/chats/${chatEntry.id}`);
              }}
              isConnected={isGroup ? null : isConnected}
            />
          );
        })}
      </ul>
    </section>
  );
}
