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
import { useLanguage } from "../contexts/LanguageContext";
import { EditMessageDialog } from "../components/chat/EditMessageDialog";
import { usePermissions } from "../hooks/usePermissions";
import { useConversation } from "../hooks/useConversation";

export const ChatPageContext = createContext({
  conversationId: null,
  isInPreview: true,
});

export function ChatPage() {
  const { id } = useParams();
  const {
    permissions,
    isFetching: isFetchingPermissions,
    error: fetchingPermissionsError,
  } = usePermissions(id);
  const {
    conversation,
    membersCount,
    isFetching: isFetchingConversation,
    error: conversationError,
  } = useConversation(id);
  console.log(conversation, isFetchingConversation);
  const { isConnected } = useSocket();
  const [isInPreviewMode, setIsInPreviewMode] = useState(false);
  const [previewImageURL, setPreviewImageURL] = useState(null);
  const { isChatsPanelCollapsed } = useContext(ChatsListContext);
  const [repliedMessage, setRepliedMessage] = useState(null);
  const [editedMessage, setEditedMessage] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (!isConnected) return;
    socket.emit("join chat", String(id));
  }, [id, isConnected]);

  return (
    <ChatPageContext
      value={{
        conversationId: id,
        isInPreview: false,
        conversation,
        isFetchingConversation,
        setIsInPreviewMode,
        setPreviewImageURL,
        setRepliedMessage,
        repliedMessage,
        editedMessage,
        setEditedMessage,
        permissions,
        isFetchingPermissions,
        membersCount,
      }}
    >
      <section
        className={`flex flex-col ${isChatsPanelCollapsed ? "md:col-start-1 md:col-end-2" : language === "Arabic" ? "md:col-start-1 md:col-end-2" : "md:col-start-2 md:col-end-3"} md:row-start-1 md:row-end-2 absolute inset-0  w-screen h-dvh md:w-full md:h-full md:static scrollbar-custom overflow-hidden `}
      >
        <ChatHeader />
        <section
          className="relative basis-full flex flex-col flex-1 overflow-hidden 
             bg-white dark:bg-slate-950 
             bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
             dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] 
             [background-size:16px_16px]"
          style={{
            backgroundAttachment: "scroll",
            backgroundRepeat: "repeat",
          }}
        >
          <MessagesList />
          <SendMessageForm />
          {editedMessage && <EditMessageDialog message={editedMessage} />}
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
