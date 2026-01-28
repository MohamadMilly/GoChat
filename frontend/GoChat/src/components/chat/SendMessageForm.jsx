import { useState } from "react";
import { socket } from "../../socket";
import { useEffect } from "react";
import { useRef } from "react";

let counter = 0;

export function SendMessageForm({ conversationId }) {
  const [message, setMessage] = useState("");

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
        mimeType: "text/plain",
        type: "TEXT",
      },
      String(conversationId),
      client_offset,
    );
    setMessage("");
    // scroll the messages container to bottom
    const container = document.getElementById("messages-scrollable");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };
  return (
    <form
      className="sticky bottom-0 bg-gray-500 p-2 z-10"
      onSubmit={onSend}
      method="POST"
    >
      <div>
        <input
          className="w-full px-2 py-1"
          type="text"
          aria-label="message input"
          onChange={onMessageChange}
          value={message}
        />
      </div>
      <div className="flex justify-end mt-2">
        <button
          className="px-3 py-1 bg-cyan-700 text-white rounded"
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
