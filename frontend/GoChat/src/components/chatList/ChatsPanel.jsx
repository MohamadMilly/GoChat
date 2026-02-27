import { SearchBar } from "../ui/SearchBar";
import { Chats } from "./Chats";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { useContext, useEffect } from "react";
import { socket } from "../../socket";
import { useSearchParams } from "react-router";
import { filterConversations } from "../../utils/filterConversations";
import { useSocket } from "../../contexts/SocketContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { ChatEntriesLoading } from "../skeletonLoadingComponents/ChatEntriesLoading";
import Button from "../ui/Button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { ChatsListContext } from "../../routes/ChatsListPage";

export function ChatsPanel() {
  const { isConnected } = useSocket();
  const { language } = useLanguage();
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
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className={`md:z-100 bg-white dark:bg-gray-900 group ${isChatsPanelCollapsed ? "absolute top-0 bottom-0 ltr:left-0 rtl:right-0 ltr:-translate-x-full rtl:translate-x-full " : language === "Arabic" ? "md:col-start-2 md:col-end-3 relative" : "md:col-start-1 md:col-end-2 relative"}`}
    >
      <Button
        className={`absolute z-2 hidden md:flex ${isChatsPanelCollapsed ? "opacity-100 ltr:translate-x-full rtl:-translate-x-full" : "opacity-0"} text-gray-600 dark:text-gray-100 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 top-1/2 ltr:right-0 rtl:left-0  -translate-y-1/2 transition-all duration-300 group-hover:opacity-100 ltr:translate-x-3/4 rtl:-translate-x-3/4 w-11 h-11 justify-center items-center rounded-full!`}
        onClick={() => handleChatsPanelCollapse(!isChatsPanelCollapsed)}
      >
        {isChatsPanelCollapsed ? (
          language === "Arabic" ? (
            <ArrowBigLeft size={20} />
          ) : (
            <ArrowBigRight size={22} />
          )
        ) : language === "Arabic" ? (
          <ArrowBigRight size={20} />
        ) : (
          <ArrowBigLeft size={22} />
        )}
      </Button>
      <div
        className={`border-r-2 h-full border-gray-200 dark:border-gray-700 flex flex-col max-h-full ${isChatsPanelCollapsed ? "animate-fade hidden" : "animate-slideup"} `}
      >
        <SearchBar
          name="name"
          query={query}
          label={translations.SearchBar[language].SearchChat}
        />
        <p className="px-3 text-sm text-gray-500 dark:text-gray-200">
          {isFetching ? (
            <span className="inline-block w-5 p-1.5 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></span>
          ) : (
            filteredConversations?.length || 0
          )}{" "}
          <span>{translations.ChatsPanel[language].ChatsLabel}</span>
        </p>
        {isFetching ? (
          <ChatEntriesLoading />
        ) : error ? (
          <p>
            {translations.Common[language].ErrorPrefix} {error.message}
          </p>
        ) : (
          <Chats chatsEntries={filteredConversations} />
        )}
      </div>
    </aside>
  );
}
