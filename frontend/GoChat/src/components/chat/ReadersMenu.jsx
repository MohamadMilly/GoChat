import { SlideUpMenu } from "../ui/SlideupMenu";
import { useMessageReader } from "../../hooks/useMessageReaders";
import { Avatar } from "../chat/Avatar";
import { useContext } from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { ChatBubbleContext } from "./ChatBubble";
import { useAuth } from "../../contexts/AuthContext";

export function ReadersMenu() {
  const { conversationId, isInPreview } = useContext(ChatPageContext);
  const { messageId, isReadersVisible, clickYCoords, isFadeRunning } =
    useContext(ChatBubbleContext);
  const { user } = useAuth();
  const { readers, isFetching, error } = useMessageReader(
    messageId,
    conversationId,
  );
  const readersWithOutMe =
    readers && !isFetching
      ? readers.filter(
          (readerOnMessage) => readerOnMessage.readerId !== user.id,
        )
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
        <p className="text-xs">Join the group to see the readers</p>
      ) : isFetching ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : readersWithOutMe.length === 0 ? (
        <p className="text-sm text-gray-400">No Readers yet</p>
      ) : (
        <>
          <h4 className="text-sm text-gray-700 mb-2">Seen by</h4>
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
                      seen at{" "}
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
}
