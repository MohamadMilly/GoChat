import { memo, useContext, useMemo, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router";
import { Avatar } from "./Avatar";
import { getTypingUsers } from "../../utils/getTypingUsers";
import { ChatPageContext } from "../../routes/ChatPage";
import { getConnectedUsers } from "../../utils/getConnectedUsers";
import { TransitionLink } from "../ui/TransitionLink";
import Button from "../ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { ChatHeaderLoading } from "../skeletonLoadingComponents/ChatHeaderLoading";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { ChatHeaderMenu } from "./ChatHeaderMenu";
import { formatLastSeen } from "../../utils/formatLastSeen";
import { printGroupTypingUsers } from "../../utils/printGroupTypingUsers";

export function ChatHeader() {
  const {
    permissions,
    conversation,
    isFetchingConversation,
    membersCount,
    isAdmin,
    chatAvatar,
    chatPartner,
    color,
    isBlockingMe,
    isGroup,
    chatTitle,
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
      chatAvatar={chatAvatar}
      chatTitle={chatTitle}
      color={color}
      isGroup={isGroup}
      chatPartner={chatPartner}
      isBlockingMe={isBlockingMe}
    />
  );
}

export const ChatHeaderContent = memo((props) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { connectedUsers, typingUsers } = useSocket();
  const conversation = props.conversation;

  const [transitionId, setTransitionId] = useState(null);

  const thisChatConnectedUsers = useMemo(
    () => getConnectedUsers(conversation?.participants || [], connectedUsers),
    [connectedUsers, conversation?.participants],
  );

  if (props.isFetchingConversation)
    return <ChatHeaderLoading isGroup={false} />;

  const isBlockingMe = props.isBlockingMe;
  const isGroup = props.isGroup;
  const chatPartner = props.chatPartner;
  const chatAvatar = props.chatAvatar;
  const chatTitle = props.chatTitle;
  const color = props.color;

  const connectedUsersCount = thisChatConnectedUsers.length;

  const isOneToOneChatPartnerConnected = isGroup
    ? null
    : thisChatConnectedUsers.some((user) => user.userId == chatPartner.id);
  const thisChatTypingUsers = getTypingUsers(
    conversation.participants,
    typingUsers,
    props.conversationId,
  );
  /* if the conversation is direct and partner is diconnected */
  const lastSeenDate = !isGroup
    ? formatLastSeen(chatPartner.profile.lastSeen)
    : null;

  const typingUsersFormatted =
    thisChatConnectedUsers.length > 0
      ? printGroupTypingUsers(thisChatConnectedUsers)
      : "";
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
                  <span className="line-clamp-1">{typingUsersFormatted}</span>
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
              ) : isBlockingMe ? (
                <span className="text-red-500 text-xs bg-red-100 dark:bg-red-200/10 p-0.5 rounded">
                  Blocking you
                </span>
              ) : thisChatTypingUsers.length > 0 ? (
                translations.ChatHeader[language].TypingStandalone
              ) : isOneToOneChatPartnerConnected ? (
                <span className="text-cyan-600 dark:text-cyan-400">
                  {translations.ChatHeader[language].Online}
                </span>
              ) : (
                <span>{lastSeenDate}</span>
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
