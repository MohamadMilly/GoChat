import { useNavigate, useParams } from "react-router";
import { useMyConversations } from "../../hooks/me/useMyConversations";
import { useConversation } from "../../hooks/useConversation";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import { Link } from "../ui/Link";
import { ChatHeader } from "./ChatHeader";
import chatBackground from "../../assets/chat_background.png";
import { useMessages } from "../../hooks/useMessages";
import { MessagesList } from "./MessagesList";
import { ArrowBigLeft } from "lucide-react";
import { useJoinGroup } from "../../hooks/me/useJoinGroup";
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
  if (isFetchingMyConversations) return <p>Loading...</p>;
  if (myConversationsError) return <p>Error: {myConversationsError.message}</p>;

  const isJoined = conversations.some((conversation) => conversation.id == id);
  const isLoggedIn = !!user;

  const handleJoinGroup = () => {
    join(id);
  };
  if (isSuccess) {
    navigate(`/chats/${id}`);
  }
  return (
    <div className="px-4 py-2 flex flex-col items-center gap-2 bg-white">
      {isLoggedIn ? (
        isJoined ? (
          <>
            <p className="text-sm text-gray-400">
              You are already in this group
            </p>
            <Link route={`/chats/${id}`} className="text-xs rounded-md">
              Go to the chat
            </Link>{" "}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              You are in read-only preview. Join the group to send messages
            </p>
            <Button onClick={handleJoinGroup} className={"text-xs"}>
              Join
            </Button>
          </>
        )
      ) : (
        <p>
          You are in read-only preview. Log in to join/send messages to this
          group.
        </p>
      )}
    </div>
  );
}

export function GroupPreview() {
  const { id } = useParams();
  const naviagte = useNavigate();
  const {
    messages,
    type,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(id);
  return (
    <>
      <div className="inset-0 bg-gray-600/20 backdrop-blur-xs absolute"></div>
      <section className="absolute top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-20  max-w-200 min-w-80">
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
            backgroundImage: `url(${chatBackground})`,
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
            {isFetchingMessages ? (
              <p>Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-lg h-full flex justify-center items-center text-gray-800">
                No messages yet.
              </p>
            ) : (
              <MessagesList messages={messages} type={type} />
            )}
          </article>
        </div>

        <GroupPreviewFooter />
      </section>
    </>
  );
}
