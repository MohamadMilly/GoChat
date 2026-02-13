import { useParams } from "react-router";
import { SendMessageForm } from "../components/chat/SendMessageForm";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessagesList } from "../components/chat/MessagesList";

import { createContext, useEffect } from "react";
import { socket } from "../socket";
import chatBackground from "../assets/chat_background.png";

import { useMessages } from "../hooks/useMessages";
import { useRef } from "react";

import { useSocket } from "../contexts/SocketContext";

export const ChatPageContext = createContext({ conversationId: null });

export function ChatPage() {
  const { id } = useParams();
  const { isConnected } = useSocket();
  const messagesListRef = useRef(null);
  const {
    messages,
    type,
    error: messagesError,
    isFetching: isFetchingMessages,
  } = useMessages(id);

  useEffect(() => {
    console.log("runs");
    if (!isConnected) return;
    socket.emit("join chat", String(id));
  }, [id, isConnected]);

  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [messages]);

  if (messagesError) {
    return <p>Error: {messagesError.message}</p>;
  }
  if (isFetchingMessages) {
    return <p>Loading...</p>;
  }

  return (
    <ChatPageContext value={{ conversationId: id }}>
      <section className="flex flex-col md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-2 absolute inset-0 h-full w-full md:static scrollbar-custom overflow-hidden ">
        <ChatHeader />
        <section
          className="w-full relative basis-full flex-1 overflow-hidden"
          style={{
            backgroundImage: `url(${chatBackground})`,
            backgroundAttachment: "fixed",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="inset-0 absolute bg-gray-600/20"></div>

          {messages && messages.length === 0 ? (
            <p
              className="text-center text-lg h-full flex justify-center items-center text-gray-800 z-10
            "
            >
              No messages yet.
            </p>
          ) : (
            <MessagesList
              ref={messagesListRef}
              messages={messages}
              type={type}
            />
          )}
        </section>
        <SendMessageForm />
      </section>
    </ChatPageContext>
  );
}
