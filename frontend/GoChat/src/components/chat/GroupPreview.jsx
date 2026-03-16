import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import { Link } from "../ui/Link";
import { ChatHeaderContent } from "./ChatHeader";
import { MessagesListContent } from "./MessagesList";
import { ArrowBigLeft } from "lucide-react";
import { useJoinGroup } from "../../hooks/me/useJoinGroup";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { LoadingLayer } from "../ui/LoadingLayer";
import { useConversation } from "../../hooks/useConversation";

function GroupPreviewFooter({ isJoined, isFetchingConversation }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { mutate: join, isPending: isJoinPending } = useJoinGroup();
  const { language } = useLanguage();

  const isLoggedIn = !!user;

  const handleJoinGroup = () => {
    if (typeof id === "undefined") return;
    join(id);
  };
  if (isJoinPending) {
    return <LoadingLayer title={"Joining"} />;
  }
  return (
    <div className="px-4 py-2 flex flex-col items-center gap-2 bg-white dark:bg-gray-800">
      {isFetchingConversation ? (
        <p className="text-sm text-white">Loading...</p>
      ) : isLoggedIn ? (
        isJoined ? (
          <>
            <p className="text-sm text-gray-400 dark:text-gray-200">
              {translations.GroupPreview[language].AlreadyInGroup}
            </p>
            <Link
              route={`/chats/group/${id}`}
              className="text-xs rounded-md dark:text-gray-200 dark:bg-gray-700"
            >
              {translations.GroupPreview[language].GoToChat}
            </Link>{" "}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              {translations.GroupPreview[language].ReadOnlyJoinPrompt}
            </p>
            <Button onClick={handleJoinGroup} className={"text-base"}>
              {translations.GroupPreview[language].JoinButton}
            </Button>
          </>
        )
      ) : (
        <p>{translations.GroupPreview[language].ReadOnlyLoginPrompt}</p>
      )}
    </div>
  );
}

export function GroupPreview() {
  const { id } = useParams();
  const naviagte = useNavigate();

  const {
    conversation,
    membersCount,
    isAdmin,
    isJoined,
    isFetching: isFetchingConversation,
    error: conversationFecthingError,
  } = useConversation(id);

  return (
    <>
      <div className="inset-0 bg-gray-600/20 backdrop-blur-xs absolute"></div>
      <section className="absolute top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-20  w-11/12 sm:w-120 md:w-200 min-w-80">
        <Button
          onClick={() => naviagte(-1)}
          className={"bg-white my-2 text-gray-600"}
        >
          <ArrowBigLeft size={20} />
        </Button>
        <ChatHeaderContent
          permissions={conversation?.permissions}
          conversation={conversation}
          isFetchingConversation={isFetchingConversation}
          membersCount={membersCount}
          isAdmin={isAdmin}
          conversationId={id}
        />
        <div
          className="flex flex-col flex-1 relative h-[70vh] bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
             dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:bg-slate-950
             [background-size:16px_16px]"
          style={{
            backgroundAttachment: "fixed",
            backgroundRepeat: "repeat",
          }}
        >
          <div className="inset-0 absolute bg-gray-600/20"></div>
          <article
            className="flex flex-col z-10 flex-1 overflow-y-auto scrollbar-custom"
            aria-label="polite"
          >
            <MessagesListContent conversationId={id} />
          </article>
        </div>

        <GroupPreviewFooter
          isJoined={isJoined}
          isFetchingConversation={isFetchingConversation}
        />
      </section>
    </>
  );
}
