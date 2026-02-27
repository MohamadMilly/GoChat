import { useMessageReader } from "../../hooks/useMessageReaders";
import { Avatar } from "../chat/Avatar";
import { memo, useContext, useMemo } from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { ChatBubbleContext } from "./ChatBubble";
import { useAuth } from "../../contexts/AuthContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export const ReadersMenu = memo(() => {
  const { conversationId, isInPreview } = useContext(ChatPageContext);
  const { messageId, isReadersVisible, clickYCoords, isFadeRunning } =
    useContext(ChatBubbleContext);
  const { user } = useAuth();
  const { readers, isFetching, error } = useMessageReader(
    messageId,
    conversationId,
  );
  const { language } = useLanguage();
  const readersWithOutMe = useMemo(() => {
    return readers && !isFetching
      ? readers.filter(
          (readerOnMessage) => readerOnMessage.readerId !== user.id,
        )
      : [];
  }, [isFetching, readers, user.id]);
  readers && !isFetching
    ? readers.filter((readerOnMessage) => readerOnMessage.readerId !== user.id)
    : [];
  if (!isReadersVisible) return;
  return (
    <div
      className={`w-60 text-gray-700 ${isReadersVisible && "animate-pop"} ${isFadeRunning && "animate-fade"} bg-white p-2 rounded-lg absolute md:-left-2 left-3/4 top-[var(--top)] -translate-x-full`}
      style={{
        "--top": Math.floor(clickYCoords - 80) + "px",
      }}
    >
      {isInPreview ? (
        <p className="text-xs">
          {translations.ReadersMenu[language].JoinPreview}
        </p>
      ) : isFetching ? (
        <p>{translations.ReadersMenu[language].Loading}</p>
      ) : error ? (
        <p>
          {translations.ReadersMenu[language].ErrorPrefix} {error.message}
        </p>
      ) : readersWithOutMe.length === 0 ? (
        <p className="text-sm text-gray-400">
          {translations.ReadersMenu[language].NoReaders}
        </p>
      ) : (
        <>
          <h4 className="text-sm text-gray-700 mb-2">
            {translations.ReadersMenu[language].SeenBy}
          </h4>
          <ul className="divide-y divide-gray-200">
            {readersWithOutMe.map((readerOnMessage) => {
              const fullname =
                readerOnMessage.reader.firstname +
                " " +
                readerOnMessage.reader.lastname;

              return (
                <li className="flex items-center gap-2 p-1">
                  <Avatar
                    avatar={readerOnMessage.reader?.profile.avatar}
                    chatTitle={fullname}
                    color={readerOnMessage?.accountColor}
                    size="35px"
                    className="text-sm!"
                  />
                  <div className="text-xs flex flex-col items-start">
                    <span>{fullname}</span>
                    <span className="text-gray-400">
                      {translations.ReadersMenu[language].SeenAtPrefix}{" "}
                      {new Date(readerOnMessage.seenAt).toLocaleString("en-US")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
});
