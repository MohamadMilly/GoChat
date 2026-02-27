import { memo, useContext, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router";
import { Avatar } from "./Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { getTypingUsers } from "../../utils/getTypingUsers";
import { ChatPageContext } from "../../routes/ChatPage";
import { getChatInfo } from "../../utils/getChatInfo";
import { getConnectedUsers } from "../../utils/getConnectedUsers";
import { useConversation } from "../../hooks/useConversation";
import { TransitionLink } from "../ui/TransitionLink";
import Button from "../ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { ChatHeaderLoading } from "../skeletonLoadingComponents/ChatHeaderLoading";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

export const ChatHeader = memo(({ id }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { connectedUsers, typingUsers } = useSocket();
  const { user } = useAuth();
  const { conversationId } = useContext(ChatPageContext);
  const {
    conversation,
    membersCount,
    isFetching: isFetchingConversation,
    error: conversationError,
  } = useConversation(conversationId || id);

  const [transitionId, setTransitionId] = useState(null);

  if (isFetchingConversation) return <ChatHeaderLoading isGroup={false} />;
  if (conversationError) return <p>Error: {conversationError.message}</p>;

  const { chatTitle, chatAvatar, color, chatPartner, isGroup } = getChatInfo(
    {
      participants: conversation.participants,
      title: conversation.title,
      avatar: conversation.avatar,
      type: conversation.type,
    },
    user.id,
  );
  const thisChatConnectedUsers = getConnectedUsers(
    conversation.participants,
    connectedUsers,
  );

  const connectedUsersCount = thisChatConnectedUsers.length;
  const isOneToOneChatPartnerConnected = isGroup
    ? null
    : connectedUsersCount === 2
      ? true
      : false;
  const thisChatTypingUsers = getTypingUsers(
    conversation.participants,
    typingUsers,
    conversationId || id,
  );

  return (
    <header className="z-20 border-b-2 border-gray-100 dark:border-gray-700 px-4 py-2 shadow-lg bg-white dark:bg-gray-800 flex items-center gap-2">
      <Button
        onClick={() => navigate("/chats", { viewTransition: true })}
        className={"text-gray-600 md:hidden"}
      >
        <p className="sr-only">{translations.Common[language].GoBackSR}</p>
        <ArrowBigLeft size={18} />
      </Button>
      <TransitionLink
        route={
          isGroup
            ? `/chats/${conversationId || id}/details`
            : `/users/${chatPartner.id}`
        }
        setDynamicTransitionId={setTransitionId}
        className={"flex items-center gap-x-2"}
      >
        <Avatar
          dynamicTransitionId={transitionId}
          chatTitle={chatTitle}
          avatar={chatAvatar}
          color={color}
        />
        <div className="flex flex-col justify-center items-start">
          <p className="text-sm text-gray-900 dark:text-gray-50">{chatTitle}</p>
          <span
            dir={language === "Arabic" ? "rtl" : "ltr"}
            className="text-xs text-gray-700 dark:text-gray-100"
          >
            {isGroup ? (
              thisChatTypingUsers.length > 0 ? (
                thisChatTypingUsers.map((userData) => {
                  return (
                    <span>
                      {userData.user.firstname +
                        translations.ChatHeader[language].TypingSuffix}
                    </span>
                  );
                })
              ) : (
                membersCount +
                " " +
                translations.ChatHeader[language].MembersLabel +
                " | " +
                connectedUsersCount +
                " " +
                translations.ChatHeader[language].OnlineLabel
              )
            ) : thisChatTypingUsers.length > 0 ? (
              translations.ChatHeader[language].TypingStandalone
            ) : isOneToOneChatPartnerConnected ? (
              <span className="text-cyan-600">
                {translations.ChatHeader[language].Online}
              </span>
            ) : (
              <span>
                {translations.ChatHeader[language].LastSeenPrefix}{" "}
                {new Date(chatPartner.profile.lastSeen).toLocaleTimeString()}
              </span>
            )}
          </span>
        </div>
      </TransitionLink>
    </header>
  );
});
