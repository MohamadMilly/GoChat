import { Menu, PanelRight } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link } from "../ui/Link";

export function ChatsListHeader() {
  const { isConnected } = useSocket();
  const { language } = useLanguage();
  return (
    <header className="col-start-1 col-end-3 row-start-1 row-end-2 bg-gray-50 dark:bg-gray-900 shadow-xs">
      <nav className="flex items-center justify-between gap-x-4 px-4 h-16">
        <div className="flex items-center gap-x-3">
          <img
            className="w-10 h-10 dark:brightness-150"
            src="/GoChat_logo.png"
            alt="GoChat logo"
          />
          <div>
            <h1
              className="text-lg font-semibold tracking-tight font-rupik
             text-cyan-600 dark:text-cyan-400"
            >
              GoChat
            </h1>
            <div className="text-xs text-gray-400 dark:text-gray-200">
              {isConnected
                ? translations.ChatHeader[language].Online
                : translations.Common[language].Connecting}
            </div>
          </div>
        </div>
        <button
          command="show-modal"
          commandfor="drawer"
          className="rounded-md dark:hover:bg-gray-800/50 p-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 cursor-pointer"
        >
          <PanelRight />
        </button>
      </nav>
    </header>
  );
}
