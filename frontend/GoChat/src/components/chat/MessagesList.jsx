import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useMessages } from "../../hooks/useMessages";
import { MessagesListLoading } from "../skeletonLoadingComponents/MessagesListLoading";
import { ChatBubbleMenu } from "./ChatBubbleMenu";

/*
TO DO :
ChatBubbleMenuContainer is a layer in messages list which will receive a message and pass it via context (which is stored in a state) to the ChatBubbleMenu 
it will contain the messages and one menu component that will flow depending on where the user clicks
this created an isolated place for the flow between ChatBubble and its Menu
*/

export const ChatBubbleContainerContext = createContext({ message: null });

function ChatBubbleMenuContainer({ children }) {
  const [message, setMessage] = useState(null);
  const [clickCoords, setClickCoords] = useState({ x: null, y: null });
  const menuRef = useRef(null);

  useEffect(() => {
    const menu = menuRef.current;
    const handleClickOutSide = (e) => {
      if (message && !menu.contains(e.target)) {
        setMessage(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutSide);
    return () => {
      window.removeEventListener("mousedown", handleClickOutSide);
    };
  }, [message]);
  return (
    <ChatBubbleContainerContext
      value={{ message, setMessage, setClickCoords, clickCoords }}
    >
      {message && (
        <div className="text-white w-full h-full inset-0 bg-gray-700/30 z-100 absolute">
          <ChatBubbleMenu
            message={message}
            clickCoords={clickCoords}
            menuRef={menuRef}
          />
        </div>
      )}{" "}
      {children}
    </ChatBubbleContainerContext>
  );
}

export function MessagesList() {
  const { conversationId } = useContext(ChatPageContext);
  return <MessagesListContent conversationId={conversationId} />;
}

export function MessagesListContent(props) {
  const { user } = useAuth();
  const messagesListRef = useRef(null);

  const {
    messages,
    type,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(props.conversationId);

  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [messages]);

  if (isFetchingMessages) return <MessagesListLoading />;
  if (messagesError) return <p>Error: {messagesError.message}</p>;
  return (
    <ChatBubbleMenuContainer>
      <ul
        dir="ltr"
        ref={messagesListRef}
        className="flex-1 px-1 sm:px-3 pt-1 pb-6 overflow-visible overflow-y-auto overflow-x-hidden z-10 scrollbar-custom"
      >
        {messages && messages.length === 0 ? (
          <p
            className="text-center text-lg h-full flex justify-center items-center text-gray-800 dark:text-gray-100 p-1 z-10
            "
          >
            No messages yet.
          </p>
        ) : (
          messages.map((message, index) => {
            const previousMessageDate = messages[index - 1]
              ? messages[index - 1].createdAt
              : null;

            const isNewDayMessage = previousMessageDate
              ? new Date(message.createdAt).getDate() !=
                new Date(previousMessageDate).getDate()
              : true;

            const sender = message.sender;
            const isMyMessage = user.id === sender.id;

            const isThereNextMessageFromTheSameUser =
              messages[index + 1]?.senderId === message.senderId;
            const isTherePreviousMessageFromTheSameuser =
              messages[index - 1]?.senderId === message.senderId;

            return (
              <Fragment key={message.id || message.createdAt}>
                {isNewDayMessage && (
                  <span
                    dir="rtl"
                    className="text-xs text-gray-500 dark:text-gray-200 bg-gray-50/40 dark:bg-gray-600/40 mx-auto my-2 block w-fit p-0.5 rounded"
                  >
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                )}

                <ChatBubble
                  message={message}
                  isGroupMessage={type === "GROUP"}
                  isMyMessage={isMyMessage}
                  hideAvatar={isThereNextMessageFromTheSameUser}
                  hideName={isTherePreviousMessageFromTheSameuser}
                />
              </Fragment>
            );
          })
        )}
      </ul>
    </ChatBubbleMenuContainer>
  );
}
