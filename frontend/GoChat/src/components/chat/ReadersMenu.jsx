import { useMessageReader } from "../../hooks/useMessageReaders";
import { Avatar } from "../chat/Avatar";
import { memo, useContext, useMemo } from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { ChatBubbleContext } from "./ChatBubble";
import { useAuth } from "../../contexts/AuthContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export const ReadersMenu = memo(({ messageId }) => {
  const { conversationId, isInPreview } = useContext(ChatPageContext);

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

  return (
    <div
      className={`w-50 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 p-2 z-20 border-b border-gray-200 dark:border-gray-600`}
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
        <p className="text-sm text-gray-400 dark:text-gray-300">
          {translations.ReadersMenu[language].NoReaders}
        </p>
      ) : (
        <>
          <h4 className="text-sm text-gray-700 dark:text-gray-100 mb-2">
            {translations.ReadersMenu[language].SeenBy}
          </h4>
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
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
                    color={readerOnMessage?.reader?.accountColor}
                    size="35px"
                    className="text-sm!"
                  />
                  <div className="text-xs flex flex-col items-start">
                    <span className="font-medium">{fullname}</span>
                    <span className="text-gray-400 dark:text-gray-300 text-[10px]">
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
