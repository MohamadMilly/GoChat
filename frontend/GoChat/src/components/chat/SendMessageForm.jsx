import { createContext, memo, useContext, useState } from "react";
import { socket } from "../../socket";
import { useEffect } from "react";
import { useRef } from "react";
import { MediaDrawer } from "./MediaDrawer";
import { Paperclip, Smile, Send, X, Reply, Sticker } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { useAuth } from "../../contexts/AuthContext";
import EmojiPicker from "emoji-picker-react";
import Button from "../ui/Button";
import { useTheme } from "../../contexts/ThemeContext";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSendMessage } from "../../hooks/chat/useSendMessage";
import { StickersPanel } from "./sendMessageForm/StickersPanel";

/* Edge case : when user leaves the conversation (the send message unmounts before the stop typing event is emitted ) 
for that reason we need to emit this event on unmount 
*/

function useTyping(message, conversationId) {
  const typingRef = useRef(false);

  useEffect(() => {
    return () => {
      socket.emit("stopped typing", conversationId);
    };
  }, [conversationId]);
  useEffect(() => {
    if (!typingRef.current && message) {
      socket.emit("typing", conversationId);
      typingRef.current = true;
    }
    const timer = setTimeout(() => {
      const isTyping = typingRef.current;
      if (isTyping) {
        socket.emit("stopped typing", conversationId);
        typingRef.current = false;
      }
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [message, conversationId]);
}

function useScrollDown(ref) {
  const scroll = (ref) => {
    const el = ref.current;
    if (!el) return;
    /* because updating the UI and rerendering is async so i need to wait for the upper process */
    setTimeout(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  };
  return () => scroll(ref);
}

export const SendMessageFormContext = createContext({});

export const SendMessageForm = memo(({ messagesListRef }) => {
  const [message, setMessage] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [hasAttached, setHasAttached] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewFileURL, setPreviewFileURL] = useState(null);
  const [stickersOpen, setStickersOpen] = useState(false);
  const [mediaFileData, setMediaFileData] = useState({
    file: null,
    mimeType: null,
  });
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const {
    setRepliedMessage,
    repliedMessage,
    permissions,
    isFetchingPermissions,
    isCurrentUserAdmin,
    conversationId,
  } = useContext(ChatPageContext);

  const messageTextAreaRef = useRef(null);

  useTyping(message, conversationId.toString());
  const send = useSendMessage();
  const scroll = useScrollDown(messagesListRef);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageData = {
      message: message,
      previewFileURL: previewFileURL,
      mediaFileData: mediaFileData,
      repliedMessage: repliedMessage,
    };
    send(messageData, user, conversationId);
    scroll();

    // state reset
    setMessage("");
    setHasAttached(false);
    setRepliedMessage(null);
    setStickersOpen(false);
    setMediaFileData({ file: null, mimeType: null });
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
    <SendMessageFormContext value={{ repliedMessage, scroll }}>
      <div
        dir={language === "Arabic" ? "rtl" : "ltr"}
        className="z-20 shrink-0 sticky md:bottom-4 bottom-2 mx-2"
      >
        {repliedMessage && (
          <div
            style={{ "--color": repliedMessage.sender?.accountColor }}
            dir={"ltr"}
            className="relative border-l-6 border-[var(--color)] px-4 py-3 bg-gray-50/50 dark:bg-gray-600/20 backdrop-blur-xs shadow-gray-100 dark:shadow-gray-100/40 shadow-inner m-2 rounded-lg animate-slideup "
          >
            <p
              style={{ "--color": repliedMessage.sender?.accountColor }}
              className="text-[var(--color)] flex items-center gap-0.5"
            >
              <Reply size={18} className="inline" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Reply to
              </span>
              <span className="font-medium">
                {repliedMessage.sender.firstname +
                  " " +
                  repliedMessage.sender.lastname}
              </span>
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-300 flex gap-1 items-center">
              {repliedMessage.type === "STICKER" ? (
                <>
                  {" "}
                  <Sticker size={15} /> <span>Sticker</span>
                </>
              ) : (
                <p className="line-clamp-1">{repliedMessage?.content}</p>
              )}
            </div>
            <button
              className={
                "absolute top-2 right-2 text-gray-600 dark:text-gray-300 cursor-pointer"
              }
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
          <form className="relative" method="POST" onSubmit={handleSendMessage}>
            <EmojiPicker
              style={{
                backgroundColor: theme === "light" ? "white" : "#1e2939",
              }}
              previewConfig={{ showPreview: false }}
              theme={theme === "light" ? "light" : "dark"}
              onEmojiClick={handlePickEmoji}
              open={showEmojiPicker}
              width={"100%"}
            />
            <StickersPanel
              open={stickersOpen}
              setOpen={setStickersOpen}
              repliedMessage={repliedMessage}
              scroll={scroll}
            />
            <div className="flex  items-center px-3 py-2 rounded-4xl bg-white/20 border border-gray-50 dark:border-gray-700/50 backdrop-blur-xs dark:bg-gray-800/20 shadow-inner shadow-white/60 dark:shadow-gray-500/70">
              <button
                onClick={() => setIsDrawerVisible((prev) => !prev)}
                type="button"
                className="p-2 text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Paperclip />
                <span className="sr-only">
                  {translations.SendMessageForm[language].AttachFileSR}
                </span>
              </button>

              <button
                type="button"
                className="p-2 text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile />
                <span className="sr-only">
                  {translations.SendMessageForm[language].EmojiSR}
                </span>
              </button>
              <label htmlFor="chat" className="sr-only">
                {translations.SendMessageForm[language].YourMessageSR}
              </label>
              <textarea
                dir="auto"
                id="chat"
                rows="1"
                className="block max-h-37.5 md:min-h-12 resize-none mx-4 p-2.5 w-full text-sm text-gray-900 bg-white/30 dark:bg-gray-900/50 dark:text-gray-50 outline-2 outline-gray-400/20 dark:outline-gray-200/20 focus:outline-offset-2 focus:outline-cyan-600/80 dark:focus:outline-cyan-400/80 rounded-lg"
                placeholder={translations.SendMessageForm[language].Placeholder}
                onChange={onMessageChange}
                value={message}
                ref={messageTextAreaRef}
                required
              ></textarea>

              {message.trim() ? (
                <button
                  type="submit"
                  className="inline-flex animate-slideRight justify-center p-2 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-cyan-600/10 "
                >
                  <Send />
                  <span className="sr-only">
                    {translations.SendMessageForm[language].SendMessageSR}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setStickersOpen(true)}
                  type="button"
                  className="p-2 text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Sticker />
                  <span className="sr-only">Sticker</span>
                </button>
              )}
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
                Sending message is not allowed in this group
              </p>
            </div>
          </div>
        )}
      </div>
    </SendMessageFormContext>
  );
});
