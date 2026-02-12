import { InputField } from "../ui/InputField";
import { SearchBar } from "../ui/SearchBar";
import { Chats } from "./Chats";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { useEffect } from "react";
import { socket } from "../../socket";
import { useSearchParams } from "react-router";
import { filterConversations } from "../../utils/filterConversations";
import { useSocket } from "../../contexts/SocketContext";

export function ChatsPanel() {
  const { isConnected } = useSocket();
  const { isFetching, conversations, error } = useMyConversations();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("name");

  useEffect(() => {
    if (!isFetching || conversations.length === 0 || !isConnected) return;
    conversations.forEach((c) => {
      socket.auth.serverOffset[c.id.toString()] =
        c.messages[c.messages.length - 1]?.id || 0;
      socket.emit("join chat", String(c.id));
    });
  }, [conversations, isFetching, isConnected]);

  if (isFetching) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">Error: {error.message}</p>;

  const filteredConversations = filterConversations(conversations, query);
  return (
    <aside className="md:col-start-1 md:col-end-2 border-r-2 border-gray-200 bg-white flex flex-col max-h-full">
      <SearchBar name="name" query={query} label={"Search Chat"} />
      <p className="px-3 text-sm text-gray-500">
        {filteredConversations?.length || 0} chats
      </p>
      <Chats chatsEntries={filteredConversations} />
    </aside>
  );
}
