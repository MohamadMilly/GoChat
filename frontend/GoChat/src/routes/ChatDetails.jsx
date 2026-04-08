import { NavLink, useNavigate, useParams } from "react-router";
import { useConversation } from "../hooks/useConversation";
import { useSocket } from "../contexts/SocketContext";
import { getConnectedUsers } from "../utils/getConnectedUsers";
import { Avatar } from "../components/chat/Avatar";
import { Tag } from "../components/ui/Tag";
import Button from "../components/ui/Button";
import { ArrowBigLeft, Pen } from "lucide-react";
import { getGenertedTransitionId } from "../utils/transitionId";
import { TransitionLink } from "../components/ui/TransitionLink";
import { useState } from "react";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { LoadingLayer } from "../components/ui/LoadingLayer";

function ChatParticipant({ participant, isConnected, showOnlineStatus }) {
  const [transitionId, setTransitionId] = useState(null);
  const { language } = useLanguage();
  return (
    <li className="py-2">
      <TransitionLink
        setDynamicTransitionId={setTransitionId}
        className={"flex items-center gap-x-2 w-full"}
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
          <div className="flex items-center justify-between w-full">
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
    </li>
  );
}

export function ParticipantsSection({
  language,
  participants,
  showOnlineStatus = true,
}) {
  const { connectedUsers } = useSocket();
  return (
    <section
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="p-4 mt-4 bg-white dark:bg-gray-800 shadow-sm rounded-md mx-2 md:mx-0"
    >
      <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
        {translations.ChatDetails[language].MembersHeading}
      </h3>

      <ul className="p-2 my-2 divide-y dark:divide-gray-700 divide-gray-200 ">
        {participants.map((participant) => {
          const isConnected = connectedUsers.some(
            (id) => id == participant.user.id,
          );
          return (
            <ChatParticipant
              participant={participant}
              showOnlineStatus={showOnlineStatus}
              isConnected={isConnected}
              key={participant.user.id}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function ChatDetails() {
  const { id } = useParams();
  const {
    conversation,
    membersCount,
    isFetching: isConversationFetching,
    error: conversationFetchingError,
  } = useConversation(id);
  const { connectedUsers } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    permissions,
    isFetching: isFetchingPermissions,
    error: permissionsFetchingError,
  } = usePermissions(id);
  if (isConversationFetching) return <LoadingLayer title={"Loading..."} />;
  if (permissionsFetchingError) {
    throw new Error(permissionsFetchingError);
  }
  if (conversationFetchingError) {
    throw new Error(conversationFetchingError);
  }

  const { title, avatar, description, participants, createdAt, admins } =
    conversation;

  const isCurrentUserAdmin = admins.some((admin) => admin.userId === user.id);

  const thisChatConnectedUsers = getConnectedUsers(
    participants,
    connectedUsers,
  );

  const connectedUsersCount = thisChatConnectedUsers.length || 0;
  const transitionId = getGenertedTransitionId();
  const dynamicTransitionName = `${title.replaceAll(" ", "-")}-${transitionId}`;
  return (
    <main className="max-w-200 mx-auto dark:bg-gray-900 font-rubik relative pb-6">
      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{translations.Common[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
        {admins.some((admin) => admin.userId === user.id) && (
          <Button
            onClick={() => navigate(`/chats/groups/${conversation.id}/edit`)}
            className="text-gray-600 dark:text-gray-300"
          >
            <p className="sr-only">Edit</p>
            <Pen size={20} />
          </Button>
        )}
      </div>
      <section
        dir={language === "Arabic" ? "rtl" : "ltr"}
        style={{
          backgroundImage: `url('${avatar}')`,
          viewTransitionName: dynamicTransitionName,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="bg-gray-100  dark:bg-gray-800 p-4 min-h-70 flex flex-col flex-wrap justify-end items-start"
      >
        {" "}
        <div className="w-full">
          <h2 className="text-xl text-gray-800 dark:text-gray-50 wrap-break-word">
            {title}
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {membersCount} {translations.ChatDetails[language].MembersLabel}{" "}
          {(permissions?.onlineMembers || isCurrentUserAdmin) &&
            "| " +
              connectedUsersCount +
              " " +
              translations.ChatDetails[language].OnlineLabel}
        </p>
      </section>
      <section
        dir={language === "Arabic" ? "rtl" : "ltr"}
        className="px-4 mx-2 md:mx-0 mt-4 py-2 bg-white dark:bg-gray-800 shadow-sm rounded-md"
      >
        <article className="py-1.5 my-2">
          <p className="text-gray-900 dark:text-gray-100 text-balance wrap-break-word">
            {description || translations.ChatDetails[language].NoDescription}
          </p>
          <h2 className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mt-1">
            {translations.ChatDetails[language].DescriptionHeading}
          </h2>
        </article>
      </section>
      <ParticipantsSection
        language={language}
        participants={participants}
        showOnlineStatus={permissions?.onlineMembers || isCurrentUserAdmin}
      />
    </main>
  );
}
