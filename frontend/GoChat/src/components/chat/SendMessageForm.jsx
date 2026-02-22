import { useContext, useState } from "react";
import { socket } from "../../socket";
import { useEffect } from "react";
import { useRef } from "react";
import { MediaDrawer } from "./MediaDrawer";
import { Paperclip, Smile, Send } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";
import EmojiPicker from "emoji-picker-react";

let counter = 0;

export function SendMessageForm() {
  const [message, setMessage] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const messagesQueueRef = useRef([]);
  const [hasAttached, setHasAttached] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageTextAreaRef = useRef(null);
  const [mediaFileData, setMediaFileData] = useState({
    file: null,
    mimeType: null,
  });

  useEffect(() => {
    let ignore = false;
    if (messagesQueueRef.current.length > 0) {
      messagesQueueRef.current.forEach(async (pendingMessage) => {
        const { data, error } = await supabase.storage
          .from("files")
          .upload(
            `${Date.now()}-${pendingMessage.file.name}`,
            pendingMessage.file,
            { contentType: pendingMessage.mimeType },
          );
        if (error) {
          console.error(error.message);
          throw new Error(error.message);
        }
        const { data: publicUrlData } = supabase.storage
          .from("files")
          .getPublicUrl(data.path);
        const client_offset = `${socket.id}-${++counter}`;
        if (ignore) return;
        socket.emit(
          "chat message",
          {
            createdAt: pendingMessage.createdAt,
            content: pendingMessage.content,
            fileURL: publicUrlData.publicUrl || "",
            mimeType: pendingMessage?.mimeType || "text/plain",
            type: pendingMessage.mimeType.includes("image") ? "IMAGE" : "FILE",
          },
          String(conversationId),
          client_offset,
        );
        messagesQueueRef.current.shift();
      });
    }
    return () => {
      ignore = true;
    };
  });
  const [previewFileURL, setPreviewFileURL] = useState(null);

  const { conversationId } = useContext(ChatPageContext);
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    const client_offset = `${socket.id}-${++counter}`;
    const now = new Date();
    const optimisticMessage = {
      createdAt: now,
      sender: user,
      content: message,
      file: mediaFileData.file,
      fileURL: previewFileURL,
      mimeType: mediaFileData?.mimeType || "text/plain",
      type: mediaFileData.mimeType
        ? mediaFileData.mimeType.includes("image")
          ? "IMAGE"
          : "FILE"
        : "TEXT",
      status: "pending",
    };
    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old?.messages || !old?.type) return old;
        return {
          ...old,
          messages: [...old.messages, optimisticMessage],
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
              messages: [optimisticMessage],
            };
          }
          return conversation;
        }),
      };
    });
    if (hasAttached) {
      messagesQueueRef.current = [
        ...messagesQueueRef.current,
        optimisticMessage,
      ];
    } else {
      socket.emit(
        "chat message",
        {
          createdAt: optimisticMessage.createdAt,
          content: message,
          fileURL: "",
          mimeType: "text/plain",
          type: "TEXT",
        },
        String(conversationId),
        client_offset,
      );
    }
    setMessage("");
    setPreviewFileURL(null);
    setHasAttached(false);
  };

  const handlePickEmoji = (emojiObj) => {
    setMessage((prev) => prev + emojiObj.emoji);
  };
  const onMessageChange = (e) => {
    const el = messageTextAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";

    setMessage(e.target.value);
  };
  return (
    <form className="sticky bottom-0 z-20" method="POST" onSubmit={onSend}>
      <EmojiPicker
        onEmojiClick={handlePickEmoji}
        open={showEmojiPicker}
        width={"100%"}
      />

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
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile />
          <span className="sr-only">Emoji</span>
        </button>

        <textarea
          id="chat"
          rows="1"
          className="block max-h-60 resize-none min-h-15 mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
          placeholder="Your message..."
          onChange={onMessageChange}
          value={message}
          ref={messageTextAreaRef}
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
        setPreviewFileURl={setPreviewFileURL}
        setHasAttached={setHasAttached}
      />
    </form>
  );
}
