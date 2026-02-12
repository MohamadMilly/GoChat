import { useParams } from "react-router";
import { SendMessageForm } from "../components/chat/SendMessageForm";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessagesList } from "../components/chat/MessagesList";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useEffect } from "react";
import { socket } from "../socket";
import chatBackground from "../assets/chat_background.png";
import Button from "../components/ui/Button";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

export const ChatPageContext = createContext({ conversationId: null });

export function ChatPage() {
  const { id } = useParams();
  const { isConnected } = useSocket();
  const {
    messages,
    type,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(id);
  useEffect(() => {
    if (!isConnected) return;
    socket.emit("join chat", String(id));
  }, [id, isConnected]);

  /* 
  
  const queryClient = useQueryClient();
  useEffect(() => {
    function onReceiveMessage(message, conversationId, serverOffset) {
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          if (!old?.messages || !old?.type) return old;
          return {
            ...old,
            messages: [...old.messages, message],
          };
        },
      );
      socket.auth.serverOffset = serverOffset;
    }

    socket.on("chat message", onReceiveMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
    };
  }, [id, queryClient]); */

  if (messagesError) {
    return <p>Error: {messagesError.message}</p>;
  }
  if (isFetchingMessages) {
    return <p>Loading...</p>;
  }

  return (
    <ChatPageContext value={{ conversationId: id }}>
      <section className="flex flex-col md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-2 overflow-y-auto scrollbar-custom absolute inset-0 md:static ">
        <ChatHeader />
        <div
          className="flex flex-col w-full flex-1 relative"
          style={{
            backgroundImage: `url(${chatBackground})`,
            backgroundAttachment: "fixed",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="inset-0 absolute bg-gray-600/20"></div>
          <section
            className="flex flex-col z-10 flex-1 p-2"
            aria-label="polite"
          >
            {messages && messages.length === 0 ? (
              <p className="text-center text-lg h-full flex justify-center items-center text-gray-800">
                No messages yet.
              </p>
            ) : (
              <MessagesList messages={messages} type={type} />
            )}
          </section>
          <SendMessageForm />
        </div>
        <Button onClick={() => socket.disconnect()}>Disconnect</Button>
        <Button onClick={() => socket.connect()}>Connect</Button>
      </section>
    </ChatPageContext>
  );
}
