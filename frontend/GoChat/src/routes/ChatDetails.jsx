import { NavLink, useNavigate, useParams } from "react-router";
import { useConversation } from "../hooks/useConversation";
import { useSocket } from "../contexts/SocketContext";
import { getConnectedUsers } from "../utils/getConnectedUsers";
import { Avatar } from "../components/chat/Avatar";
import Button from "../components/ui/Button";
import { ArrowBigLeft } from "lucide-react";
import { getGenertedTransitionId } from "../utils/transitionId";
import { TransitionLink } from "../components/ui/TransitionLink";
import { useState } from "react";

function ChatParticipant({ participant, isConnected }) {
  const [transitionId, setTransitionId] = useState(null);
  return (
    <li className="py-2">
      <TransitionLink
        setDynamicTransitionId={setTransitionId}
        className={"flex items-center gap-x-2"}
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
          <span
            className={`absolute w-3 h-3 bottom-0 right-0 rounded-full ${isConnected ? "bg-cyan-600 dark:bg-cyan-400" : "bg-gray-400 dark:bg-gray-300"}`}
          ></span>
        </div>

        <div className="flex flex-col items-start">
          <p className="text-sm text-gray-800 dark:text-gray-100">
            {participant.user.firstname + " " + participant.user.lastname}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-300">
            joined at {new Date(participant.joinedAt).toLocaleString("en-GB")}
          </span>
        </div>
      </TransitionLink>
    </li>
  );
}

export function ChatDetails() {
  const { id } = useParams();
  const { conversation, membersCount, isFetching, error } = useConversation(id);
  const { connectedUsers } = useSocket();
  const navigate = useNavigate();
  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { title, avatar, description, participants, createdAt } = conversation;
  const thisChatConnectedUsers = getConnectedUsers(
    participants,
    connectedUsers,
  );
  const connectedUsersCount = thisChatConnectedUsers.length || 0;
  const transitionId = getGenertedTransitionId();
  const dynamicTransitionName = `${title.replaceAll(" ", "-")}-${transitionId}`;
  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg my-2">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">Go Back</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <section
        style={{
          backgroundImage: `url('${avatar}')`,
          viewTransitionName: dynamicTransitionName,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="bg-gray-100 dark:bg-gray-800 p-4 min-h-70 flex flex-col justify-end items-start"
      >
        <h2 className="text-xl text-gray-800 dark:text-gray-50">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {membersCount} members | {connectedUsersCount} online
        </p>
      </section>
      <section className="px-4 mt-4 py-2 bg-white dark:bg-gray-800 shadow-sm rounded-md">
        <article className="py-1.5 my-2">
          <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{description || "No description"}</span>
          </p>
          <h2 className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mt-1">
            Description
          </h2>
        </article>
      </section>
      <section className="p-4 mt-4 bg-white dark:bg-gray-800 shadow-sm rounded-md">
        <h3 className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
          Members
        </h3>
        {
          <ul className="p-2 my-2 divide-y divide-gray-700">
            {participants.map((participant) => {
              const isConnected = connectedUsers.some(
                (id) => id == participant.user.id,
              );
              return (
                <ChatParticipant
                  participant={participant}
                  avatar={avatar}
                  isConnected={isConnected}
                  key={participant.user.id}
                />
              );
            })}
          </ul>
        }
      </section>
    </main>
  );
}
