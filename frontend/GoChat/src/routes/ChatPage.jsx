import { useParams } from "react-router";
import { SendMessageForm } from "../components/chat/SendMessageForm";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessagesList } from "../components/chat/MessagesList";
import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import chatBackground from "../assets/chat_background.png";
import darkChatBackground from "../assets/chat_background_dark.png";
import { useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import Button from "../components/ui/Button";
import { X } from "lucide-react";
import { ChatsListContext } from "./ChatsListPage";
import { useTheme } from "../contexts/ThemeContext";

export const ChatPageContext = createContext({
  conversationId: null,
  isInPreview: true,
});

export function ChatPage() {
  const pendingMessagesRef = useRef([]);
  const { id } = useParams();
  const { isConnected } = useSocket();
  const [isInPreviewMode, setIsInPreviewMode] = useState(false);
  const [previewImageURL, setPreviewImageURL] = useState(null);
  const { isChatsPanelCollapsed } = useContext(ChatsListContext);
  const [repliedMessage, setRepliedMessage] = useState(null);
  const { theme } = useTheme();
  useEffect(() => {
    if (!isConnected) return;
    socket.emit("join chat", String(id));
  }, [id, isConnected]);

  return (
    <ChatPageContext
      value={{
        conversationId: id,
        isInPreview: false,
        pendingMessagesRef,
        setIsInPreviewMode,
        setPreviewImageURL,
        setRepliedMessage,
        repliedMessage,
      }}
    >
      <section
        className={`flex flex-col ${isChatsPanelCollapsed ? "md:col-start-1 md:col-end-2" : " md:col-start-2 md:col-end-3"} md:row-start-1 md:row-end-2 absolute inset-0 h-screen w-screen md:w-full md:h-full md:static scrollbar-custom overflow-hidden `}
      >
        <ChatHeader />
        <section
          className="w-full relative basis-full flex flex-col flex-1 overflow-hidden"
          style={{
            backgroundImage: `url(${theme === "light" ? chatBackground : darkChatBackground})`,
            backgroundAttachment: "scroll",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="inset-0 absolute bg-gray-600/20 dark:bg-gray-800/60 backdrop-contrast-150"></div>
          <MessagesList />
          <SendMessageForm />
        </section>

        {isInPreviewMode && (
          <div className="fixed z-900 inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md animate-pop overflow-y-auto">
            <img
              src={previewImageURL}
              alt="Preview"
              className="w-200 h-auto object-contain rounded-xl"
            />
            <Button
              onClick={() => setIsInPreviewMode(false)}
              className="absolute top-4 right-4 px-3 py-1 text-gray-700 rounded"
            >
              <X size={25} />
            </Button>
          </div>
        )}
      </section>
    </ChatPageContext>
  );
}
