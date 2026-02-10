import { useContext, useState } from "react";
import { socket } from "../../socket";
import { useEffect } from "react";
import { useRef } from "react";
import { MediaDrawer } from "./MediaDrawer";
import { Paperclip, Image, Send } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
let counter = 0;

export function SendMessageForm() {
  const [message, setMessage] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [mediaFileData, setMediaFileData] = useState(null);
  const { conversationId } = useContext(ChatPageContext);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const onMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
    const timer = setTimeout(() => {
      if (messageRef.current === message) {
        socket.emit("stopped typing", String(conversationId));
      }
      return () => clearTimeout(timer);
    }, 3000);
  }, [message, conversationId]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!message) return;
      socket.emit("typing", String(conversationId));
    }, 500);
    return () => clearTimeout(timer);
  }, [message, conversationId]);
  const onSend = (e) => {
    e.preventDefault();
    const client_offset = `${socket.id}-${counter++}`;
    socket.emit(
      "chat message",
      {
        content: message,
        fileURL: "",
        mimeType: mediaFileData?.mimeType || "text/plain",
        type: mediaFileData ? "FILE" : "TEXT",
      },
      String(conversationId),
      client_offset,
    );
    setMessage("");
    const container = document.getElementById("messages-scrollable");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old?.messages || !old?.type) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              createdAt: new Date(),
              sender: user,
              content: message,
              fileURL: "",
              mimeType: mediaFileData?.mimeType || "text/plain",
              type: mediaFileData ? "FILE" : "TEXT",
            },
          ],
        };
      },
    );

    queryClient.setQueryData(["conversations"], (old) => {
      if (!old?.conversations) return old;
      return {
        ...old,
        conversations: old.conversations.map((conversation) => {
          if (conversation.id == conversationId) {
            return {
              ...conversation,
              messages: [
                {
                  createdAt: new Date(),
                  sender: user,
                  content: message,
                  fileURL: "",
                  mimeType: mediaFileData?.mimeType || "text/plain",
                  type: mediaFileData ? "FILE" : "TEXT",
                },
              ],
            };
          }
          return conversation;
        }),
      };
    });
  };
  return (
    <form className="sticky bottom-0 z-20" method="POST" onSubmit={onSend}>
      <label htmlFor="chat" className="sr-only">
        Your message
      </label>
      <div className="flex items-center px-3 py-2 rounded-t-lg bg-white shadow">
        <button
          onClick={() => setIsDrawerVisible((prev) => !prev)}
          type="button"
          className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100"
        >
          <Paperclip />
          <span className="sr-only">Attach file</span>
        </button>

        <button
          type="button"
          className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100"
        >
          <Image />
          <span className="sr-only">Upload image</span>
        </button>

        <textarea
          id="chat"
          rows="1"
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
          placeholder="Your message..."
          onChange={onMessageChange}
          value={message}
        ></textarea>

        <button
          type="submit"
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 "
        >
          <Send />
          <span className="sr-only">Send message</span>
        </button>
      </div>
      <MediaDrawer
        isVisible={isDrawerVisible}
        setMediaFileData={setMediaFileData}
        mediaFileData={mediaFileData}
        setIsVisible={setIsDrawerVisible}
      />
    </form>
  );
}
