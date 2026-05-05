import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useMessages } from "../../hooks/useMessages";
import { MessagesListLoading } from "../skeletonLoadingComponents/MessagesListLoading";
import { ChatBubbleMenu } from "./ChatBubbleMenu";
import { useMemo } from "react";
import { socket } from "../../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import MessagesQueryTrigger from "./MessagesQueryTrigger";
import { Circle } from "lucide-react";
import { forwardRef } from "react";
import { Spinner } from "../ui/Spinner";
/*
TO DO : (DONE)
ChatBubbleMenuContainer is a layer in messages list which will receive a message and pass it via context (which is stored in a state) to the ChatBubbleMenu 
it will contain the messages and one menu component that will flow depending on where the user clicks
this created an isolated place for the flow between ChatBubble and its Menu
*/

export const ChatBubbleContainerContext = createContext({ message: null });

function ChatBubbleMenuContainer({ children }) {
  const [message, setMessage] = useState(null);
  const [clickCoords, setClickCoords] = useState({ x: null, y: null });
  const { isCurrentUserAdmin } = useContext(ChatPageContext);
  const menuRef = useRef(null);
  const { user } = useAuth();
  const isCurrentUserMessage = message ? user.id === message?.senderId : false;
  useEffect(() => {
    const menu = menuRef.current;
    const handleClickOutSide = (e) => {
      if (!menu) return;
      if (message && !menu.contains(e.target)) {
        setMessage(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutSide);
    return () => {
      window.removeEventListener("mousedown", handleClickOutSide);
    };
  }, [message]);
  const contextValue = useMemo(
    () => ({ message, setMessage, setClickCoords, clickCoords }),
    [clickCoords, message],
  );
  return (
    <ChatBubbleContainerContext value={contextValue}>
      {message && (message.senderId === user.id || isCurrentUserAdmin) && (
        <div className="text-white w-full h-full inset-0 bg-gray-700/30 z-100 fixed">
          <ChatBubbleMenu
            setMessage={setMessage}
            message={message}
            clickCoords={clickCoords}
            menuRef={menuRef}
            isCurrentUserMessage={isCurrentUserMessage}
          />
        </div>
      )}{" "}
      {children}
    </ChatBubbleContainerContext>
  );
}

export function MessagesList({ ref = null }) {
  const { conversationId } = useContext(ChatPageContext);

  return (
    <ChatBubbleMenuContainer>
      <MessagesListContent conversationId={conversationId} ref={ref} />
    </ChatBubbleMenuContainer>
  );
}

export const MessagesListContent = forwardRef((props, ref) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesListRef = ref;
  const navigate = useNavigate();
  const { setMessage, setClickCoords } = useContext(ChatBubbleContainerContext);
  const { setRepliedMessage } = useContext(ChatPageContext);
  const prevScrollRef =
    useRef(
      0,
    ); /* I want to store the previous scroll to prevent the scroll from jumping */
  const { setIsInPreviewMode, setPreviewImageURL } =
    useContext(ChatPageContext);
  const {
    messages,
    type,
    isFetchingNextPage,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(props.conversationId);

  const memoizedMessages = useMemo(() => messages, [messages]);
  const isFetchingInitialData = isFetchingMessages && messages.length === 0;
  useEffect(() => {
    if (messagesListRef.current && !isFetchingInitialData) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [isFetchingInitialData, messagesListRef]);
  useEffect(() => {
    function onUserJoin(conversationId, fullname) {
      const messageList = messagesListRef.current;
      if (!messageList) return;
      const newMemberNotification = document.createElement("span");
      newMemberNotification.textContent = `${fullname} joined the conversation`;
      newMemberNotification.className =
        "p-0.5 bg-gray-200/15 backdrop-blur-md dark:bg-gray-700/15 text-gray-600 dark:text-gray-100 rounded text-sm mx-auto text-center block my-3";
      messageList.appendChild(newMemberNotification);
      /* update conversation data is in socketContext*/
    }
    socket.on("join conversation", onUserJoin);

    return () => {
      socket.off("join conversation", onUserJoin);
    };
  }, [queryClient, messagesListRef]);
  useEffect(() => {
    function onUserLeave(withDelete, fullname, userId, conversationId) {
      const messageList = messagesListRef.current;
      if (withDelete) {
        // Navigate to main menu if 'leave' event involves deletion.
        navigate("/chats");
      } else {
        if (!messageList) return;
        const leftMemberNotification = document.createElement("span");
        leftMemberNotification.textContent = `${fullname} left the conversation`;
        leftMemberNotification.className =
          "p-0.5 bg-gray-200/15 backdrop-blur-md dark:bg-gray-700/15 text-gray-600 dark:text-gray-100 rounded text-sm mx-auto text-center block my-3";
        messageList.appendChild(leftMemberNotification);
        /* update conversation data is in the context */
      }
    }
    socket.on("leave conversation", onUserLeave);

    return () => {
      socket.off("leave conversation", onUserLeave);
    };
  }, [queryClient, navigate, messagesListRef]);
  /* TO DO :
  if the conversation going to be deleted , then remove it ! ,
  or if it is not going to be deleted create a notification 
  */
  const handleShowChatBubbleMenu = useCallback(
    (message, x, y) => {
      setClickCoords({ x: x, y: y });
      setMessage(message);
    },
    [setClickCoords, setMessage],
  );
  const handleReply = useCallback(
    (message) => setRepliedMessage(message),
    [setRepliedMessage],
  );

  const handlePreview = useCallback(
    (fileURL) => {
      setIsInPreviewMode(true);
      setPreviewImageURL(fileURL);
    },
    [setIsInPreviewMode, setPreviewImageURL],
  );
  useEffect(() => {
    if (messagesListRef.current && messages.length > 0) {
      const diff = messagesListRef.current.scrollHeight - prevScrollRef.current;
      if (diff > 0) {
        messagesListRef.current.scrollTop += diff;
      }
      prevScrollRef.current = messagesListRef.current.scrollHeight;
    }
  }, [messages.length, messagesListRef]);
  if (isFetchingInitialData) return <MessagesListLoading />;
  if (messagesError) return <p>Error: {messagesError.message}</p>;

  return (
    <ul
      style={{
        overflowAnchor: "auto",
      }}
      dir="ltr"
      className="flex-1 px-1 sm:px-3 pt-1 pb-6"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center items-center text-cyan-600 dark:text-cyan-400">
          <Spinner size={20} />
        </div>
      )}
      {memoizedMessages && memoizedMessages.length === 0 ? (
        <p
          className="text-center text-lg h-full flex justify-center items-center text-gray-800 dark:text-gray-100 p-1 z-10
            "
        >
          No messages yet.
        </p>
      ) : (
        memoizedMessages.map((message, index) => {
          const previousMessageDate = memoizedMessages[index - 1]
            ? memoizedMessages[index - 1].createdAt
            : null;

          const isNewDayMessage = previousMessageDate
            ? new Date(message.createdAt).getDate() !=
              new Date(previousMessageDate).getDate()
            : true;

          const sender = message.sender;
          const isMyMessage = user.id === sender.id;

          const isThereNextMessageFromTheSameUser =
            memoizedMessages[index + 1]?.senderId === message.senderId;
          const isTherePreviousMessageFromTheSameuser =
            memoizedMessages[index - 1]?.senderId === message.senderId;

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
                key={message.id}
                message={message}
                isGroupMessage={type === "GROUP"}
                isMyMessage={isMyMessage}
                hideAvatar={isThereNextMessageFromTheSameUser}
                hideName={isTherePreviousMessageFromTheSameuser}
                handleShowChatBubbleMenu={handleShowChatBubbleMenu}
                handleReply={handleReply}
                handlePreview={handlePreview}
              />
            </Fragment>
          );
        })
      )}
    </ul>
  );
});
