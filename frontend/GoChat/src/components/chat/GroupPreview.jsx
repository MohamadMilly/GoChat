import { useNavigate, useParams } from "react-router";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import { Link } from "../ui/Link";
import { ChatHeader } from "./ChatHeader";
import chatBackground from "../../assets/chat_background.png";
import darkChatBackground from "../../assets/chat_background_dark.png";
import { MessagesList } from "./MessagesList";
import { ArrowBigLeft } from "lucide-react";
import { useJoinGroup } from "../../hooks/me/useJoinGroup";
import { useTheme } from "../../contexts/ThemeContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

function GroupPreviewFooter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    conversations,
    isFetching: isFetchingMyConversations,
    error: myConversationsError,
  } = useMyConversations();
  const { user } = useAuth();
  const {
    mutate: join,
    isPending: isJoinPending,
    error: joinError,
    isSuccess,
  } = useJoinGroup();
  const { language } = useLanguage();
  if (isFetchingMyConversations)
    return <p>{translations.GroupPreview[language].Loading}</p>;
  if (myConversationsError)
    return (
      <p>
        {translations.GroupPreview[language].ErrorPrefix}{" "}
        {myConversationsError.message}
      </p>
    );

  const isJoined = conversations.some((conversation) => conversation.id == id);
  const isLoggedIn = !!user;

  const handleJoinGroup = () => {
    join(id);
  };
  if (isSuccess) {
    navigate(`/chats/group/${id}`);
  }
  return (
    <div className="px-4 py-2 flex flex-col items-center gap-2 bg-white dark:bg-gray-800">
      {isLoggedIn ? (
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
            <Button onClick={handleJoinGroup} className={"text-xs"}>
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
  const { theme } = useTheme();
  return (
    <>
      <div className="inset-0 bg-gray-600/20 backdrop-blur-xs absolute"></div>
      <section className="absolute top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-20  max-w-11/12 sm:max-w-120 md:max-w-200 min-w-80">
        <Button
          onClick={() => naviagte(-1)}
          className={"bg-white my-2 text-gray-600"}
        >
          <ArrowBigLeft size={20} />
        </Button>
        <ChatHeader id={id} />
        <div
          className="flex flex-col flex-1 relative h-[70vh]"
          style={{
            backgroundImage: `url(${theme === "light" ? chatBackground : darkChatBackground})`,
            backgroundAttachment: "fixed",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="inset-0 absolute bg-gray-600/20"></div>
          <article
            className="flex flex-col z-10 flex-1 overflow-y-auto scrollbar-custom"
            aria-label="polite"
          >
            <MessagesList convId={id} />
          </article>
        </div>

        <GroupPreviewFooter />
      </section>
    </>
  );
}
