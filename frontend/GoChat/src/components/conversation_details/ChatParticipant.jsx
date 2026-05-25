import { useLanguage } from "../../contexts/LanguageContext";
import { useState, useContext } from "react";
import { ChatDetailsContext } from "../../routes/ChatDetails";
import { TransitionLink } from "../ui/TransitionLink";
import translations from "../../translations";
import Tag from "../ui/Tag";
import { ManagingParticipantMenu } from "./managingParticipantMenu";
import { Avatar } from "../chat/Avatar";
import { useAuth } from "../../contexts/AuthContext";
export function ChatParticipant({
  participant,
  isConnected,
  showOnlineStatus,
}) {
  const [transitionId, setTransitionId] = useState(null);
  const { language } = useLanguage();
  const { isCurrentUserAdmin } = useContext(ChatDetailsContext);
  const { user } = useAuth();
  const isCurrentUserParticipant = participant.userId === user?.id;
  return (
    <li className="py-2 flex justify-between items-center">
      <TransitionLink
        setDynamicTransitionId={setTransitionId}
        className={"flex grow-0 items-center gap-x-2"}
        route={`/users/${participant.user.id}`}
      >
        <div className="shrink-0 relative">
          <Avatar
            dynamicTransitionId={transitionId}
            chatAvatar={participant?.user.profile?.avatar || ""}
            chatTitle={
              participant.user.firstname + " " + participant.user.lastname
            }
            color={participant.user?.accountColor || null}
          />
          {showOnlineStatus && (
            <span
              className={`absolute w-3 h-3 bottom-0 right-0 rounded-full ${isConnected ? "bg-cyan-600 dark:bg-cyan-400" : "bg-gray-400 dark:bg-gray-300"}`}
            ></span>
          )}
        </div>

        <div className="flex flex-col items-start w-full">
          <div className="flex items-center my-0.5 justify-between w-full">
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {participant.user.firstname + " " + participant.user.lastname}
            </p>
            {participant.isOwner ? (
              <Tag
                tagContent={"Owner"}
                bgColor={"bg-purple-200"}
                textColor={"text-purple-800"}
                darkModeBgColor={"dark:bg-purple-600/50"}
                darkModeTextColor={"dark:text-gray-200"}
              />
            ) : participant.isAdmin ? (
              <Tag
                tagContent={"Admin"}
                bgColor={"bg-gray-200"}
                textColor={"text-green-800"}
                darkModeBgColor={"dark:bg-green-400/50"}
                darkModeTextColor={"dark:text-gray-200"}
              />
            ) : null}
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-300">
            {translations.ChatDetails[language].JoinedAtPrefix || "joined at"}{" "}
            {new Date(participant.joinedAt).toLocaleString("en-GB")}
          </span>
        </div>
      </TransitionLink>
      {isCurrentUserAdmin && !isCurrentUserParticipant && (
        <ManagingParticipantMenu
          userId={participant.userId}
          participantId={participant.id}
          isAdmin={participant.isAdmin}
          isOwner={participant.isOwner}
        />
      )}
    </li>
  );
}
