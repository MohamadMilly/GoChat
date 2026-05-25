import { PanelRight } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "../ui/Button";

export function ChatsListHeader() {
  const { isConnected } = useSocket();
  const { language } = useLanguage();
  return (
    <header
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="col-start-1 col-end-3 row-start-1 row-end-2 bg-white dark:bg-gray-900 shadow-xs border-b border-gray-50 dark:border-gray-800"
    >
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
              {translations.Common[language].gochat}
            </h1>
            <div className="text-xs text-gray-400 dark:text-gray-200">
              {isConnected
                ? translations.ChatHeader[language].Online
                : translations.Common[language].Connecting}
            </div>
          </div>
        </div>
        <Button
          command="show-modal"
          commandfor="drawer"
          className="rounded-md flex justify-center items-center dark:hover:bg-gray-800/50 p-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            color="currentColor"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 9L20 9"></path>
            <path d="M4 15L14 15"></path>
          </svg>
        </Button>
      </nav>
    </header>
  );
}
