import { Navigate, useSearchParams } from "react-router";
import { SearchBar } from "../components/ui/SearchBar";
import { useUsers } from "../hooks/useUsers";
import { ChatEntry } from "../components/chatListComponents/ChatEntry";
import { abbreviateText } from "../utils/abbreviateText";
import { useCreateConversation } from "../hooks/useCreateConversation";
import { useSocket } from "../contexts/SocketContext";
export function NewChatPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const { connectedUsers } = useSocket();
  const {
    users,
    isFetching: isFetchingUsers,
    error: usersError,
  } = useUsers(query);
  const {
    mutate: createChat,
    data,
    isPending: isConversationPending,
    error: conversationError,
    isSuccess,
  } = useCreateConversation();
  const onOpenChat = async (selectedUserChat) => {
    createChat({
      participants: [selectedUserChat],
      type: "DIRECT",
    });
  };
  if (isSuccess && !!data) {
    return <Navigate to={`/chats/${data.conversation.id}`} />;
  }
  return (
    <main>
      <header>
        <SearchBar query={query} />
      </header>
      <section>
        {usersError ? (
          <p>Error: {usersError.message}</p>
        ) : isFetchingUsers ? (
          <p>isLoading</p>
        ) : !query ? (
          <p>Search for users</p>
        ) : users && users.length === 0 ? (
          <p>No users are found</p>
        ) : (
          <ul>
            {users.map((user) => {
              const isThereAvatar = !!user.profile?.avatar;

              const avatar =
                isThereAvatar ||
                abbreviateText(user.firstname + " " + user.lastname);
              const fullname = user.firstname + " " + user.lastname;
              const isConnected = !!connectedUsers.find((id) => id == user.id);
              return (
                <ChatEntry
                  key={user.id}
                  isGroup={false}
                  chatAvatar={avatar}
                  isThereAvatar={isThereAvatar}
                  title={fullname}
                  onOpenChat={() => onOpenChat(user)}
                  isConnected={isConnected}
                />
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
