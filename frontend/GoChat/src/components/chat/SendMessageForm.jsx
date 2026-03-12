import { memo, useContext, useState } from "react";
import { socket } from "../../socket";
import { useEffect } from "react";
import { useRef } from "react";
import { MediaDrawer } from "./MediaDrawer";
import { Paperclip, Smile, Send, X } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";
import EmojiPicker from "emoji-picker-react";
import { useSearchParams } from "react-router";
import Button from "../ui/Button";
import { useTheme } from "../../contexts/ThemeContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "react-toastify";

let counter = 0;

export const SendMessageForm = memo(() => {
  const { language } = useLanguage();
  const [message, setMessage] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [hasAttached, setHasAttached] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();
  const messageTextAreaRef = useRef(null);
  const [mediaFileData, setMediaFileData] = useState({
    file: null,
    mimeType: null,
  });
  const {
    setRepliedMessage,
    repliedMessage,
    permissions,
    isFetchingPermissions,
    isCurrentUserAdmin,
  } = useContext(ChatPageContext);
  const [searchParams] = useSearchParams();
  const { conversationId } = useContext(ChatPageContext);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [previewFileURL, setPreviewFileURL] = useState(null);

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

  const onSend = async (e) => {
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
      repliedMessage: repliedMessage,
    };

    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old?.messages) return old;
        return { ...old, messages: [...old.messages, optimisticMessage] };
      },
    );
    setMessage("");
    setHasAttached(false);
    setRepliedMessage(null);
    try {
      let finalFileURL = "";

      if (hasAttached && mediaFileData.file) {
        const { data, error } = await supabase.storage
          .from("files")
          .upload(
            `${Date.now()}-${mediaFileData.file.name}`,
            mediaFileData.file,
          );

        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from("files")
          .getPublicUrl(data.path);
        finalFileURL = publicUrlData.publicUrl;
      }

      socket.emit(
        "chat message",
        {
          createdAt: optimisticMessage.createdAt,
          content: message,
          fileURL: finalFileURL,
          mimeType: mediaFileData?.mimeType || "text/plain",
          type: finalFileURL
            ? mediaFileData.mimeType.includes("image")
              ? "IMAGE"
              : "FILE"
            : "TEXT",
          repliedMessageId: repliedMessage?.id || null,
        },
        String(conversationId),
        client_offset,
      );
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.message);
    }
  };

  const handlePickEmoji = (emojiObj) => {
    setMessage((prev) => prev + emojiObj.emoji);
  };
  const onMessageChange = (e) => {
    const el = messageTextAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";

    setMessage(e.target.value);
  };
  const handleUnAttach = () => {
    setMediaFileData({ file: null, mimeType: null });
    setHasAttached(false);
  };

  return (
    <div
      dir={language === "Arabic" ? "rtl" : "ltr"}
      className="z-20 shrink-0 relative md:bottom-4 bottom-2 mx-2"
    >
      {repliedMessage && (
        <div
          style={{ "--color": repliedMessage.sender?.accountColor }}
          dir={"ltr"}
          className="relative border-l-6 border-[var(--color)] px-4 py-3 bg-gray-50/50 dark:bg-gray-50/70 backdrop-blur-xs shadow-gray-100 shadow-inner m-2 rounded-lg animate-slideup "
        >
          <strong
            style={{ "--color": repliedMessage.sender?.accountColor }}
            className="text-[var(--color)]"
          >
            {repliedMessage.sender.firstname +
              " " +
              repliedMessage.sender.lastname}
          </strong>
          <p className="text-sm text-gray-600 line-clamp-1">
            {repliedMessage.content}
          </p>
          <button
            className={"absolute top-2 right-2 text-gray-600 cursor-pointer"}
            onClick={() => setRepliedMessage(null)}
          >
            <p className="sr-only">
              {translations.SendMessageForm[language].CancelReplySR}
            </p>
            <X size={20} />
          </button>
        </div>
      )}
      {hasAttached && (
        <div className="dark:bg-gray-800 dark:text-gray-300 p-2 rounded flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Paperclip size={18} />
            <p className="text-xs">
              {translations.SendMessageForm[language].FileAttached}
            </p>
          </div>
          <Button
            onClick={handleUnAttach}
            className={"w-7 h-7 flex items-center justify-center"}
          >
            {" "}
            <span className="sr-only">
              {translations.SendMessageForm[language].UnAttachSR}
            </span>
            <X size={10} className="shrink-0" />
          </Button>
        </div>
      )}
      {(permissions ? permissions?.sendingMessages : true) ||
      isCurrentUserAdmin ? (
        <form
          method="POST"
          onSubmit={(e) => {
            onSend(e);
          }}
        >
          <EmojiPicker
            style={{ backgroundColor: theme === "light" ? "white" : "#1e2939" }}
            previewConfig={{ showPreview: false }}
            theme={theme === "light" ? "light" : "dark"}
            onEmojiClick={handlePickEmoji}
            open={showEmojiPicker}
            width={"100%"}
          />

          <label htmlFor="chat" className="sr-only">
            {translations.SendMessageForm[language].YourMessageSR}
          </label>
          <div className="flex  items-center px-3 py-2 rounded-4xl bg-white dark:bg-gray-800 shadow">
            <button
              onClick={() => setIsDrawerVisible((prev) => !prev)}
              type="button"
              className="p-2 text-gray-500 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Paperclip />
              <span className="sr-only">
                {translations.SendMessageForm[language].AttachFileSR}
              </span>
            </button>

            <button
              type="button"
              className="p-2 text-gray-500 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile />
              <span className="sr-only">
                {translations.SendMessageForm[language].EmojiSR}
              </span>
            </button>

            <textarea
              dir="auto"
              id="chat"
              rows="1"
              className="block max-h-37.5 md:min-h-12 resize-none mx-4 p-2.5 w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-50 outline-2 outline-gray-400/20 dark:outline-gray-200/20 focus:outline-offset-2 focus:outline-cyan-600/80 dark:focus:outline-cyan-400/80 rounded-lg"
              placeholder={translations.SendMessageForm[language].Placeholder}
              onChange={onMessageChange}
              value={message}
              ref={messageTextAreaRef}
              required
            ></textarea>

            <button
              type="submit"
              className="inline-flex justify-center p-2 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-cyan-600/10 "
            >
              <Send />
              <span className="sr-only">
                {translations.SendMessageForm[language].SendMessageSR}
              </span>
            </button>
          </div>
          {(permissions?.sendingMedia || isCurrentUserAdmin) && (
            <MediaDrawer
              isVisible={isDrawerVisible}
              setMediaFileData={setMediaFileData}
              mediaFileData={mediaFileData}
              setIsVisible={setIsDrawerVisible}
              setPreviewFileURl={setPreviewFileURL}
              setHasAttached={setHasAttached}
            />
          )}
        </form>
      ) : (
        <div className="dark:bg-gray-800 bg-white ">
          <div className="flex flex-col items-center justify-center p-3">
            <p className="dark:text-gray-100 font-medium text-sm text-gray-800">
              Sending messages is not allowed in this conversation
            </p>
            <span className="dark:text-gray-600 text-xs text-gray-400">
              Restrication is due to permissions
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
