import { useParams } from "react-router";
import { SendMessageForm } from "../components/chat/SendMessageForm";
import { useConversation } from "../hooks/useConversation";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessagesList } from "../components/chat/MessagesList";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import chatBackground from "../assets/chat_background.png";

export function ChatPage() {
  const { id } = useParams();
  const { conversation, error, isFetching } = useConversation(id);
  const { user } = useAuth();
  const [typingUsersIds, setTypingUsersIds] = useState([]);
  useEffect(() => {
    socket.emit("join chat", String(id));
  }, [id]);
  const queryClient = useQueryClient();
  const messages = conversation && !isFetching ? conversation?.messages : [];
  useEffect(() => {
    function onReceiveMessage(message, conversationId, serverOffset) {
      queryClient.setQueryData(["conversation", id], (old) => {
        if (!old?.conversation) return old;
        return {
          conversation: {
            ...old.conversation,
            messages: [...old.conversation.messages, message],
          },
        };
      });
      socket.auth.serverOffset = serverOffset;
    }
    function onUserTyping(userId) {
      setTypingUsersIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    }
    function onUserStoppedTyping(userId) {
      setTypingUsersIds((prev) => prev.filter((id) => userId !== id));
    }
    socket.on("typing", onUserTyping);
    socket.on("stopped typing", onUserStoppedTyping);
    socket.on("chat message", onReceiveMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
      socket.off("typing", onUserTyping);
      socket.off("stopped typing", onUserStoppedTyping);
    };
  }, [id, queryClient]);

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  if (isFetching) {
    return <p>Loading...</p>;
  }
  if (!conversation) {
    return <p>Chat is not found.</p>;
  }
  const isDirect = conversation.type === "DIRECT";
  const chatPartners = isDirect
    ? conversation?.participants.filter((p) => p.user.id !== user.id)
    : conversation?.participants || [];
  const typingUsers = chatPartners.filter((p) =>
    typingUsersIds.includes(p.user.id),
  );

  return (
    <>
      <ChatHeader
        type={conversation.type}
        chatPartners={chatPartners}
        avatar={conversation.avatar}
        title={conversation.title}
        typingUsers={typingUsers}
      />
      <main
        className="flex flex-col w-full relative"
        style={{ backgroundImage: `url(${chatBackground})` }}
      >
        <div className="inset-0 absolute bg-gray-800/20"></div>
        <section
          className="z-10 flex-1 p-3 overflow-y-auto relative"
          aria-label="polite"
        >
          <div>
            {messages.length === 0 ? (
              <p className="text-center">No messages yet.</p>
            ) : (
              <MessagesList
                messages={messages}
                type={conversation.type}
                conversationId={id}
              />
            )}
          </div>
          <SendMessageForm conversationId={id} />
        </section>
      </main>
    </>
  );
}
