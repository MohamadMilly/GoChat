import { useParams } from "react-router";
import { SendMessageForm } from "../components/chat/SendMessageForm";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessagesList } from "../components/chat/MessagesList";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { socket } from "../socket";
import { useSocket } from "../contexts/SocketContext";
import Button from "../components/ui/Button";
import { X } from "lucide-react";
import { ChatsListContext } from "./ChatsListPage";
import { useLanguage } from "../contexts/LanguageContext";
import { EditMessageDialog } from "../components/chat/EditMessageDialog";
import { usePermissions } from "../hooks/usePermissions";
import { useConversation } from "../hooks/useConversation";
import { getChatInfo } from "../utils/getChatInfo";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../hooks/useUser";

export const ChatPageContext = createContext({
  conversationId: null,
  isInPreview: true,
});

export function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  /* Chat permissions for controlling users activity in the chat page */
  const {
    permissions,
    isFetching: isFetchingPermissions,
    error: fetchingPermissionsError,
  } = usePermissions(id);
  /* Core conversation data which contain the partnerId for the next query if the conversation is a DIRECT */
  const {
    conversation,
    membersCount,
    partnerId,
    isAdmin,
    isOwner,
    isFetching: isFetchingConversation,
    error: conversationError,
  } = useConversation(id);

  if (conversationError) {
    throw new Error(conversationError);
  }
  const { chatTitle, chatAvatar, color, chatPartner, isGroup } = useMemo(
    () =>
      getChatInfo(
        {
          participants: conversation?.participants || [],
          title: conversation?.title,
          avatar: conversation?.avatar,
          type: conversation?.type,
        },
        user.id,
      ),
    [conversation, user.id],
  );
  /* Fetch the data of the partner only if chatPartner is not undefined which applies the conversation to DIRECT */
  const {
    isBlocking,
    isFetching: isFetchingPartner,
    error: partnerDataError,
  } = useUser(partnerId?.toString());

  const { isConnected } = useSocket();
  const [isInPreviewMode, setIsInPreviewMode] = useState(false);
  const [previewImageURL, setPreviewImageURL] = useState(null);
  const { isChatsPanelCollapsed } = useContext(ChatsListContext);
  const [repliedMessage, setRepliedMessage] = useState(null);
  const [editedMessage, setEditedMessage] = useState(null);
  const { language } = useLanguage();
  const messagesListRef = useRef(null);
  const chatContentRef = useRef(null);
  useEffect(() => {
    if (!isConnected) return;
    socket.emit("join chat", String(id));
  }, [id, isConnected]);

  return (
    <ChatPageContext
      value={{
        isFetchingPartner,
        chatTitle,
        chatAvatar,
        color,
        chatPartner,
        isBlockingMe: isBlocking,
        isGroup,
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
        isCurrentUserAdmin: isAdmin,
        isCurrentUserOwner: isOwner,
      }}
    >
      <section
        className={`flex flex-col ${isChatsPanelCollapsed ? "md:col-start-1 md:col-end-2" : language === "Arabic" ? "md:col-start-1 md:col-end-2" : "md:col-start-2 md:col-end-3"} md:row-start-1 md:row-end-2 absolute inset-0 z-100 md:z-auto  w-screen h-dvh md:w-full md:h-full md:static scrollbar-custom overflow-hidden `}
      >
        <ChatHeader />
        <section
          ref={chatContentRef}
          className="relative basis-full w-full flex flex-col flex-1 overflow-y-auto scrollbar-custom
             bg-white dark:bg-slate-950
             bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
             dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] 
             [background-size:16px_16px]"
          style={{
            backgroundAttachment: "scroll",
            backgroundRepeat: "repeat",
          }}
        >
          <MessagesList ref={messagesListRef} />
          <SendMessageForm messagesListRef={chatContentRef} />
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
