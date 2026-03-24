import { memo, useContext, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router";
import { Avatar } from "./Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { getTypingUsers } from "../../utils/getTypingUsers";
import { ChatPageContext } from "../../routes/ChatPage";
import { getChatInfo } from "../../utils/getChatInfo";
import { getConnectedUsers } from "../../utils/getConnectedUsers";
import { TransitionLink } from "../ui/TransitionLink";
import Button from "../ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { ChatHeaderLoading } from "../skeletonLoadingComponents/ChatHeaderLoading";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { ChatHeaderMenu } from "./ChatHeaderMenu";

export function ChatHeader() {
  const {
    permissions,
    conversation,
    isFetchingConversation,
    membersCount,
    isAdmin,
    conversationId,
  } = useContext(ChatPageContext);

  return (
    <ChatHeaderContent
      permissions={permissions}
      conversation={conversation}
      isFetchingConversation={isFetchingConversation}
      membersCount={membersCount}
      isAdmin={isAdmin}
      conversationId={conversationId}
    />
  );
}

export const ChatHeaderContent = memo((props) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { connectedUsers, typingUsers } = useSocket();
  const { user } = useAuth();
  const conversation = props.conversation;

  const [transitionId, setTransitionId] = useState(null);

  if (props.isFetchingConversation)
    return <ChatHeaderLoading isGroup={false} />;

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
    : thisChatConnectedUsers.some((user) => user.userId == chatPartner.id);
  const thisChatTypingUsers = getTypingUsers(
    conversation.participants,
    typingUsers,
    props.conversationId,
  );

  return (
    <header
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="z-20 border-b border-gray-50 dark:border-gray-700 px-4 py-2 shadow-xs bg-white dark:bg-gray-800 flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
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
              ? `/chats/${props.conversationId}/details`
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
            <p className="text-sm text-gray-900 dark:text-gray-50">
              {chatTitle}
            </p>
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
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-200">
                    <div className="flex items-center">
                      <span className="inline-block ltr:mr-1 rtl:ml-1">
                        {props.membersCount}
                      </span>
                      <span>
                        {translations.ChatHeader[language].MembersLabel}
                      </span>
                    </div>
                    {(props.permissions?.onlineMembers || props.isAdmin) && (
                      <>
                        <span className="mx-1">|</span>
                        <div className="flex items-center">
                          <span
                            className="
                              ltr:mr-1 rtl:ml-1"
                          >
                            {connectedUsersCount}
                          </span>
                          <span>
                            {translations.ChatHeader[language].OnlineLabel}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )
              ) : thisChatTypingUsers.length > 0 ? (
                translations.ChatHeader[language].TypingStandalone
              ) : isOneToOneChatPartnerConnected ? (
                <span className="text-cyan-600 dark:text-cyan-400">
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
      </div>
      <ChatHeaderMenu isGroup={isGroup} chatPartnerId={chatPartner?.id} />
    </header>
  );
});
/* 
TODO :
i will create small components that contains each logic in the ChatHeaderMenu , so ChatHeaderMenu will only contain the logic for conditional rendering
and it will not be passed any irrelated props and pass those props via context */
