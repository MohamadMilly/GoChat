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
import { Circle, Send } from "lucide-react";
import { forwardRef } from "react";
import { Spinner } from "../ui/Spinner";
import Button from "../ui/Button";
import { useSendMessage } from "../../hooks/chat/useSendMessage";
import { useLanguage } from "../../contexts/LanguageContext";

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
      {message && (
        <div className="text-white w-full h-full inset-0 bg-gray-700/30 z-100 fixed">
          <ChatBubbleMenu
            setMessage={setMessage}
            message={message}
            clickCoords={clickCoords}
            menuRef={menuRef}
            isCurrentUserMessage={isCurrentUserMessage}
            isCurrentUserAdmin={isCurrentUserAdmin}
          />
        </div>
      )}{" "}
      {children}
    </ChatBubbleContainerContext>
  );
}

export function MessagesList({ ref = null, setActiveSticker }) {
  const { conversationId } = useContext(ChatPageContext);
  
  return (
    <ChatBubbleMenuContainer>
      <MessagesListContent
        conversationId={conversationId}
        ref={ref}
        setActiveSticker={setActiveSticker}
      />
    </ChatBubbleMenuContainer>
  );
}

function InitialMessageButton({ content, conversationId }) {
  const sendMessage = useSendMessage();
  const { user } = useAuth();
  const handleSendInitialMessage = () => {
    sendMessage(
      {
        message: content,
        previewFileURL: null,
        mediaFileData: {
          file: null,
          mimeType: null,
        },
        repliedMessage: null,
      },
      user,
      conversationId,
    );
  };
  return <Button onClick={handleSendInitialMessage}>{content}</Button>;
}

export const MessagesListContent = forwardRef((props, ref) => {
  const queryClient = useQueryClient();
  const messagesListRef = ref;
  const messagesListContentRef = useRef(null);
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
      const messageList = messagesListContentRef.current;
      if (!messageList) return;
      const newMemberNotification = document.createElement("span");
      newMemberNotification.textContent = `${fullname} joined the conversation`;
      newMemberNotification.className =
        "p-0.5 bg-gray-200/15 backdrop-blur-md dark:bg-gray-700/15 text-gray-600 dark:text-gray-100 rounded text-sm mx-auto text-center block my-3";
      messageList.appendChild(newMemberNotification);
      /* update conversation data is in socketContext*/
    }
    socket.on("join conversation broadcast", onUserJoin);

    return () => {
      socket.off("join conversation broadcast", onUserJoin);
    };
  }, [queryClient, messagesListRef]);
  useEffect(() => {
    function onUserLeave(withDelete, fullname, userId, conversationId) {
      const messageList = messagesListContentRef.current;
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
  if (messagesError) {
    throw messagesError;
  }

  return (
    <ul
      ref={messagesListContentRef}
      dir="ltr"
      className="flex-1 px-1 sm:px-3 pt-1 pb-6"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center items-center text-cyan-600 dark:text-cyan-400">
          <Spinner size={20} />
        </div>
      )}
      {memoizedMessages && memoizedMessages.length === 0 ? (
        <div
          className="text-center text-lg h-full flex flex-col gap-0.5 justify-center items-center text-gray-700 dark:text-gray-100 p-1 z-10
            "
        >
          <div className="dark:bg-gray-600/20  bg-gray-50 p-2 rounded-full animate-bounce">
            <Send size={50} />
          </div>

          <span className="p-1 rounded w-40">
            No Messages Yet, Send{" "}
            <InitialMessageButton
              content={"Hello"}
              conversationId={props.conversationId}
            />{" "}
            !
          </span>
        </div>
      ) : (
        memoizedMessages.map((message, index) => {
          const previousMessageDate = memoizedMessages[index - 1]
            ? memoizedMessages[index - 1].createdAt
            : null;

          const isNewDayMessage = previousMessageDate
            ? new Date(message.createdAt).getDate() !=
              new Date(previousMessageDate).getDate()
            : true;

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
                key={message.id || message.createdAt}
                message={message}
                isGroupMessage={type === "GROUP"}
                hideAvatar={isThereNextMessageFromTheSameUser}
                hideName={isTherePreviousMessageFromTheSameuser}
                handleShowChatBubbleMenu={handleShowChatBubbleMenu}
                handleReply={handleReply}
                handlePreview={handlePreview}
                setActiveSticker={props.setActiveSticker}
              />
            </Fragment>
          );
        })
      )}
    </ul>
  );
});
