import { InputField } from "../ui/InputField";
import { SearchBar } from "../ui/SearchBar";
import { Chats } from "./Chats";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { useContext, useEffect, useState } from "react";
import { socket } from "../../socket";
import { useSearchParams } from "react-router";
import { filterConversations } from "../../utils/filterConversations";
import { useSocket } from "../../contexts/SocketContext";
import { ChatEntriesLoading } from "../skeletonLoadingComponents/ChatEntriesLoading";
import Button from "../ui/Button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { ChatsListContext } from "../../routes/ChatsListPage";

export function ChatsPanel() {
  const { isConnected } = useSocket();
  const { isFetching, conversations, error } = useMyConversations();
  const [searchParams] = useSearchParams();

  const { handleChatsPanelCollapse, isChatsPanelCollapsed } =
    useContext(ChatsListContext);

  const query = searchParams.get("name");

  useEffect(() => {
    if (isFetching || conversations.length === 0 || !isConnected) return;
    conversations.forEach((c) => {
      socket.auth.serverOffset[c.id.toString()] =
        c.messages[c.messages.length - 1]?.id || 0;
      socket.auth.isInitialDataLoading = false;

      socket.emit("join chat", String(c.id));
    });
  }, [conversations, isFetching, isConnected]);

  const filteredConversations = filterConversations(conversations, query);
  return (
    <aside
      className={`md:z-100 bg-white dark:bg-gray-900 group ${isChatsPanelCollapsed ? " -translate-x-full  absolute top-0 bottom-0" : "md:col-start-1 md:col-end-2 relative"}`}
    >
      <Button
        className={`absolute z-2 hidden md:flex ${isChatsPanelCollapsed ? "opacity-100" : "opacity-0"} text-gray-600 dark:text-gray-100 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 top-1/2 right-0 -translate-y-1/2 transition-all duration-300 group-hover:opacity-100 translate-x-3/4 w-11 h-11 justify-center items-center rounded-full!`}
        onClick={() => handleChatsPanelCollapse(!isChatsPanelCollapsed)}
      >
        {isChatsPanelCollapsed ? (
          <ArrowBigRight size={22} />
        ) : (
          <ArrowBigLeft size={22} />
        )}
      </Button>
      <div
        className={`border-r-2 h-full border-gray-200 dark:border-gray-700 flex flex-col max-h-full ${isChatsPanelCollapsed ? "animate-fade" : "animate-slideup"} `}
      >
        <SearchBar name="name" query={query} label={"Search Chat"} />
        <p className="px-3 text-sm text-gray-500 dark:text-gray-200">
          {isFetching ? (
            <span className="inline-block w-5 p-1.5 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></span>
          ) : (
            filteredConversations?.length || 0
          )}{" "}
          <span>chats</span>
        </p>
        {isFetching ? (
          <ChatEntriesLoading />
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          <Chats chatsEntries={filteredConversations} />
        )}
      </div>
    </aside>
  );
}
