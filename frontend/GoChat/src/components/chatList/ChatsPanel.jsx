import { SearchBar } from "../ui/SearchBar";
import { Chats } from "./Chats";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { memo, useContext, useEffect } from "react";
import { socket } from "../../socket";
import { useSearchParams } from "react-router";
import { filterConversations } from "../../utils/filterConversations";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { ChatEntriesLoading } from "../skeletonLoadingComponents/ChatEntriesLoading";
import Button from "../ui/Button";
import {
  ArrowBigLeft,
  ArrowBigRight,
  MessagesSquare,
  Plus,
} from "lucide-react";
import { ChatsListContext } from "../../routes/ChatsListPage";
import { Link } from "../ui/Link";

function NewChatLink() {
  return (
    <div className="fixed z-10 md:hidden bottom-12 rtl:left-8 ltr:right-8">
      <Link
        className="rounded-full text-cyan-600 dark:text-cyan-400 w-13! h-13! flex justify-center items-center"
        route={"/chats/direct/new"}
      >
        <Plus size={30} />
      </Link>
    </div>
  );
}

export const ChatsPanel = memo(() => {
  const { language } = useLanguage();
  const { isFetching, conversations, error } = useMyConversations();
  const [searchParams] = useSearchParams();
  const PageTranslations = translations.ChatsListLanding;
  const { handleChatsPanelCollapse, isChatsPanelCollapsed } =
    useContext(ChatsListContext);

  const query = searchParams.get("name");

  useEffect(() => {
    if (isFetching || conversations.length === 0) return;
    conversations.forEach((c) => {
      socket.auth.serverOffset[c.id.toString()] =
        c.messages[c.messages.length - 1]?.id || 0;
      socket.auth.isInitialDataLoading = false;

      socket.emit("join chat", String(c.id));
    });
  }, [conversations, isFetching]);

  const filteredConversations = filterConversations(conversations, query);
  return (
    <aside
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className={`z-100 md:z-0 bg-white h-full dark:bg-gray-900 group ${isChatsPanelCollapsed ? "absolute top-0 bottom-0 ltr:left-0 rtl:right-0 ltr:-translate-x-full rtl:translate-x-full " : language === "Arabic" ? "md:col-start-2 md:col-end-3 relative" : "md:col-start-1 md:col-end-2 relative"}`}
    >
      <NewChatLink />
      <Button
        className={`absolute z-2 hidden md:flex ${isChatsPanelCollapsed ? "opacity-100" : "opacity-0"} text-gray-600 dark:text-gray-100 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 top-1/2 ltr:right-0 rtl:left-0  -translate-y-1/2 transition-all duration-300 group-hover:opacity-100 ltr:translate-x-full rtl:-translate-x-full w-11 h-11 justify-center items-center rounded-full!`}
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
        className={`md:ltr:border-r md:rtl:border-l  md:border-gray-50 dark:md:border-gray-800 flex flex-col ${isChatsPanelCollapsed ? "hidden" : "animate-slideup"} `}
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
        ) : conversations?.length > 0 ? (
          <Chats chatsEntries={filteredConversations} />
        ) : (
          <div className="flex flex-col items-center md:hidden py-4 mt-8 mx-6">
            <div className="text-cyan-600 dark:text-cyan-400">
              <MessagesSquare strokeWidth={1} size={100} />
            </div>

            <h3 className="text-md tracking-tight text-gray-700 dark:text-gray-100">
              {PageTranslations[language].Title}
            </h3>
            <p
              className="text-xs text-balance text-center my-4 text-gray-400 dark:text-gray-200
      "
            >
              {PageTranslations[language].Subtitle}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
});
