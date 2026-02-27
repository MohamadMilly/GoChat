import { Navigate, useNavigate, useSearchParams } from "react-router";
import { SearchBar } from "../components/ui/SearchBar";
import { useUsers } from "../hooks/useUsers";
import { useCreateConversation } from "../hooks/useCreateConversation";
import { useSocket } from "../contexts/SocketContext";
import { Contact } from "../components/users/Contact";
import Button from "../components/ui/Button";
import { ArrowBigLeft } from "lucide-react";
import translations from "../translations";
import { useLanguage } from "../contexts/LanguageContext";

export function NewChatPage() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    return <Navigate to={`/chats/direct/${data.conversation.id}`} />;
  }
  return (
    <main className="max-w-200 mx-auto bg-white dark:bg-gray-900 font-rubik relative">
      <div className="flex justify-start items-center p-2 bg-gray-50/30 dark:bg-gray-800/80 rounded-lg mt-2 mb-4">
        <Button
          onClick={() => navigate(-1)}
          className="text-gray-600 dark:text-gray-300"
        >
          <p className="sr-only">{translations.Common[language].GoBackSR}</p>
          <ArrowBigLeft size={20} />
        </Button>
      </div>
      <SearchBar
        query={query}
        label={translations.SearchBar[language].FindUser}
      />

      <section className="p-2 mt-4">
        {usersError ? (
          <p>{"Error: " + usersError.message}</p>
        ) : isFetchingUsers ? (
          <p className="text-xs text-gray-400 dark:text-gray-200 text-center">
            {translations.NewChatPage[language].Loading}
          </p>
        ) : !query ? (
          <p className="text-xs text-gray-400 dark:text-gray-200 text-center">
            {translations.NewChatPage[language].SearchForUsers}
          </p>
        ) : users && users.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-200 text-center">
            {translations.NewChatPage[language].NoUsersFound}
          </p>
        ) : (
          <ul className="w-full flex flex-col animate-slideup divide-y divide-gray-700">
            {users.map((user) => {
              const isThereAvatar = !!user.profile?.avatar;
              const avatar = isThereAvatar ? user.profile.avatar : null;
              return (
                <Contact
                  key={user.id}
                  firstname={user.firstname}
                  lastname={user.lastname}
                  avatar={avatar}
                  isSelected={false}
                  onClick={() => onOpenChat(user)}
                  color={user?.accountColor || null}
                />
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
