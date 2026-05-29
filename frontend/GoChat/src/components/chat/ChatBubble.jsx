import { useRef, useState, useEffect, memo, useMemo } from "react";
import { Avatar } from "./Avatar";
import { TransitionLink } from "../ui/TransitionLink";
import { Braces, FileText, FileArchive, File } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../socket";
import { ChatBubbleStatus } from "./chatBubbleStatus";
import { Sticker as StickerIcon } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";

import { useParams } from "react-router";
import translations from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { sortReactions } from "../../utils/sortReactions";

function formatMessageDate(date) {
  const dateObj = new Date(date);
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}

function VideoFile({ link }) {
  const { language } = useLanguage();
  return (
    <div className="w-full max-w-[28rem] mx-0 my-1">
      <video className="w-full h-auto max-h-[40vh] rounded" controls>
        <source src={link} type="video/mp4" />
        <source src={link} type="video/ogg"></source>
        {translations.ChatBubble[language].BrowserNotSupport}
      </video>
    </div>
  );
}

function FileItem({ icon, link, colors = {}, label = "File" }) {
  const textClass = colors.text || "text-gray-500";
  const bgClass = colors.bg || "bg-gray-200";

  return (
    <div className="h-30 max-w-full w-[25rem] md:w-[30rem] lg:w-[35rem] bg-gray-50 border px-4 py-2 md:px-5 md:py-3 border-gray-300 rounded flex items-center gap-3 md:gap-6 m-1 min-w-0">
      <div
        className={`${textClass} ${bgClass} w-15 h-15 sm:w-20 sm:h-20 rounded-full shrink-0 flex items-center justify-center`}
      >
        {icon}
      </div>

      <div className="flex-1 h-full min-w-0 bg-gray-100/50 flex flex-col items-start border border-gray-100 py-2 px-3 overflow-hidden rounded">
        <p className="text-sm md:text-base text-gray-700 truncate w-full">
          <a href={link} className="break-words inline-block w-full truncate">
            {label}
          </a>
        </p>
      </div>
    </div>
  );
}

function ImageFile({ mimeType, fileURL, editMode = false, handlePreview }) {
  /* const handlePreview = (fileURL) => {
    if (editMode) return;
    setIsInPreviewMode(true);
    setPreviewImageURL(fileURL);
  }; */
  const { language } = useLanguage();
  return (
    <div className="p-0.5 rounded-xl max-w-md overflow-hidden relative group">
      <span className="absolute top-3 left-3 text-xs text-gray-400 bg-gray-50/10 backdrop-blur-xs rounded z-10">
        {mimeType.split("/")[1].toUpperCase()}
      </span>
      {!editMode && (
        <div className="group-hover:opacity-100 opacity-0 z-10 absolute rounded-xl inset-0.5 bg-gray-900/30 backdrop-blur-xs transition-all duration-300">
          <button
            onClick={() => handlePreview(fileURL)}
            className="w-full h-full text-2xl text-gray-50 cursor-pointer tracking-tight"
          >
            {translations.ChatBubble[language].ClickToPreview}
          </button>
        </div>
      )}
      <img
        className={`${editMode ? "w-100 h-40" : "w-full h-auto"} rounded-xl object-cover block cursor-pointer `}
        src={fileURL}
        alt="Sended Message image"
        loading="lazy"
      />
    </div>
  );
}

export function MediaFilePreview({
  fileURL,
  mimeType,
  editMode,
  handlePreview,
}) {
  const { language } = useLanguage();
  if (!fileURL) return null;
  if (mimeType.includes("image")) {
    return (
      <ImageFile
        editMode={editMode}
        fileURL={fileURL}
        mimeType={mimeType}
        handlePreview={handlePreview}
      />
    );
  }
  if (mimeType.includes("application")) {
    if (mimeType.includes("json")) {
      return (
        <FileItem
          icon={<Braces size={30} />}
          link={fileURL}
          colors={{ text: "text-yellow-300", bg: "bg-yellow-100" }}
          label={translations.ChatBubble[language].JSONFile}
        />
      );
    } else if (mimeType.includes("pdf")) {
      return (
        <FileItem
          icon={<FileText size={30} />}
          link={fileURL}
          colors={{ text: "text-red-500", bg: "bg-red-200" }}
          label={translations.ChatBubble[language].PDFFile}
        />
      );
    } else if (mimeType.includes("zip")) {
      return (
        <FileItem
          icon={<FileArchive size={30} />}
          link={fileURL}
          colors={{ text: "text-yellow-300", bg: "bg-yellow-100" }}
          label={translations.ChatBubble[language].ZIPFile}
        />
      );
    }
  }
  if (mimeType.includes("text")) {
    if (mimeType.includes("html")) return <HTMLFile link={fileURL} />;
  }
  if (mimeType.includes("video")) {
    return <VideoFile link={fileURL} />;
  }
  return (
    <FileItem
      icon={<File size={30} />}
      link={fileURL}
      colors={{ text: "text-gray-500", bg: "bg-gray-200" }}
      label={translations.ChatBubble[language].FileLabel}
    />
  );
}

export function Sticker({ stickerURL, size = 120 }) {
  return (
    <div className="w-fit h-fit overflow-hidden">
      <img
        className={`w-[var(--size)] h-[var(--size)] rounded-xl object-contain`}
        style={{
          "--size": size + "px",
        }}
        src={stickerURL}
        alt="sticker"
        loading="lazy"
      />
    </div>
  );
}

function useObserve(ref) {
  const [observing, setObserving] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setObserving(true);
      }
    });
    observer.observe(el);

    return () => observer.unobserve(el);
  }, [ref]);

  return observing;
}

function useReadMessage(messageId, conversationId, userId, status, observing) {
  useEffect(() => {
    if (observing && status !== "pending") {
      socket
        .timeout(5000)
        .emit("read message", conversationId, messageId, userId, (response) => {
          if (response?.status !== "ok") {
            console.error("Read message error:", response?.status);
          }
        });
    }
  }, [conversationId, userId, messageId, status, observing]);
}

function useDrag(ref, maxDisplacement, triggerDisplacement, onTrigger) {
  /* The latest ref pattern */

  const onTriggerRef = useRef(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let hasTriggered = false;
    let startX = 0;

    const handleMove = (currentX) => {
      const diffX = startX - currentX;
      el.style.transition = "none";
      if (diffX > 0 && diffX < maxDisplacement) {
        el.style.right = diffX + "px";
      }

      if (diffX > triggerDisplacement && !hasTriggered) {
        onTriggerRef.current();
        hasTriggered = true;
      }
    };

    const handleEnd = () => {
      el.style.right = "0px";
      el.style.transition = "all 0.3s ease";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", handleEnd);
      hasTriggered = false;
    };

    const onMouseMove = (e) => handleMove(e.clientX);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX);

    const handleStart = (e) => {
      startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    };

    el.addEventListener("mousedown", handleStart);
    el.addEventListener("touchstart", handleStart);

    return () => {
      el.removeEventListener("mousedown", handleStart);
      el.removeEventListener("touchstart", handleStart);
    };
  }, [maxDisplacement, ref, triggerDisplacement]);
}

function Reaction({ type, symbol, count = 1, reactors }) {
  const firstThreeReactors = reactors.slice(0, 3);
  return (
    <div className="h-8 p-[1px] shadow-inner border border-cyan-400/18 dark:border-cyan-300/40 shadow-gray-50/30 animate-pop rounded-full bg-cyan-400/15 dark:bg-cyan-300/35 flex justify-center items-center gap-1">
      <span className="text-sm">{symbol}</span>
      {reactors.length >= 4 && <span className="text-sm">{count}</span>}
      {firstThreeReactors.length > 0 && reactors.length < 4 && (
        <div
          className="relative h-7"
          style={{
            width: 28 + (firstThreeReactors.length - 1) * 15 + "px",
          }}
        >
          {firstThreeReactors.map((reactorObj, index) => {
            const reactor = reactorObj.user;
            const fullname = reactor.firstname + " " + reactor.lastname;
            return (
              <Avatar
                className={"absolute! top-0"}
                style={{ transform: `translateX(${index * 15}px)` }}
                avatar={reactor.profile.avatar}
                chatTitle={fullname}
                color={reactor.accountColor}
                size="28px"
                titleSize="10px"
              />
            );
          })}
        </div>
      )}
      <span className="sr-only">{type}</span>
    </div>
  );
}

export const ChatBubble = memo(
  ({
    message,
    isGroupMessage,
    hideAvatar = false,
    hideName = false,
    handleShowChatBubbleMenu,
    handleReply,
    handlePreview,
  }) => {
    const { user } = useAuth();
    const [transitionId, setTransitionId] = useState(null);
    const messageContainerRef = useRef(null);
    const messageContentContainerRef = useRef(null);
    const { language } = useLanguage();
    const { id: conversationId } = useParams();
    const observing = useObserve(messageContainerRef);

    useReadMessage(
      message.id,
      conversationId,
      user.id,
      message.status,
      observing,
    );

    useDrag(messageContainerRef, 150, 100, () => handleReply(message));

    /* Because the message comes from tanstack so the reference is not changing */
    const readers = useMemo(
      () =>
        message.readers ? message.readers.map((reader) => reader.readerId) : [],
      [message.readers],
    );
    const sender = message.sender;
    const isMyMessage = user.id === sender.id;
    const fullname = sender.firstname + " " + sender.lastname;
    const isThereAvatar = !!sender.profile?.avatar;
    const avatar = isThereAvatar && sender.profile?.avatar;
    const color = sender?.accountColor || "";
    const messageDate = formatMessageDate(message.createdAt);
    const messageReactions = message.reactions;
    const isReacted = messageReactions ? messageReactions.length > 0 : false;
    const sortedReactions = isReacted ? sortReactions(messageReactions) : [];

    const scrollToMessage = (messageId, e) => {
      e.stopPropagation();
      const chatBubble = document.getElementById(messageId);
      if (chatBubble) {
        chatBubble.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        chatBubble.classList.add("highlight");
        setTimeout(() => chatBubble.classList.remove("highlight"), 3000);
      }
    };

    return (
      <li
        id={message.id}
        ref={messageContainerRef}
        className={`my-1 will-change-auto relative flex items-end gap-1 text-sm md:text-base animate-pop transition-all duration-300 ${hideAvatar && isGroupMessage ? "pl-12" : ""}`}
      >
        {isGroupMessage && !isMyMessage && !hideAvatar && (
          <TransitionLink
            route={message.sender.id ? `/users/${message.sender?.id}` : ""}
            setDynamicTransitionId={setTransitionId}
          >
            <Avatar
              avatar={avatar}
              chatTitle={fullname}
              color={color}
              size="42px"
            />
          </TransitionLink>
        )}
        <div
          className={`w-fit flex flex-col max-w-[85%] md:max-w-[75%] ${isMyMessage ? "ml-auto items-end" : "items-start"}`}
        >
          {message.type === "STICKER" ? (
            <Sticker stickerURL={message.fileURL} />
          ) : message.type !== "TEXT" ? (
            <MediaFilePreview
              fileURL={message.fileURL}
              mimeType={message.mimeType}
              handlePreview={handlePreview}
            />
          ) : null}
          <div
            onClick={(e) => {
              handleShowChatBubbleMenu(message, e.clientX, e.clientY);
            }}
            ref={messageContentContainerRef}
            className={`group relative w-full px-2 py-0.5 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 dark:bg-cyan-600 rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 dark:bg-gray-700 rounded-bl-none rounded-br-xl"} cursor-grab`}
          >
            <div className="min-w-0 w-full">
              {isGroupMessage && !isMyMessage && !hideName && (
                <p
                  className={`${color ? "text-[var(--color)]" : "text-gray-800"} font-medium `}
                  style={{ "--color": color }}
                >
                  {fullname}
                </p>
              )}
              {message.repliedMessage && (
                <button
                  onClick={(e) => scrollToMessage(message.repliedMessage.id, e)}
                  className={`px-2 border-l-5 dark:text-gray-300 border-[var(--accountColor)] w-full min-w-50 py-0.5 my-0.5 rounded flex flex-col items-start gap-0.5 ${isMyMessage ? "bg-[var(--accountColor)]/20" : "bg-[var(--accountColor)]/10"} shadow-[var(--accountColor)]/40 shadow-inner`}
                  style={{
                    "--accountColor":
                      message.repliedMessage.sender?.accountColor,
                  }}
                >
                  <strong className="text-sm text-clamp-1 w-full text-start">
                    {message.repliedMessage.sender.id === user.id
                      ? translations.ChatBubble[language].YouLabel
                      : message.repliedMessage.sender.firstname +
                        " " +
                        message.repliedMessage.sender.lastname}
                  </strong>
                  <div className="text-xs flex gap-1 items-center w-full text-start">
                    {message.repliedMessage.type === "STICKER" ? (
                      <>
                        {" "}
                        <StickerIcon size={15} /> <span>Sticker</span>
                      </>
                    ) : (
                      <p className="line-clamp-2 text-balance">
                        {message.repliedMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              )}
              {message.content && (
                <p
                  className="wrap-break-word whitespace-pre-wrap dark:text-gray-200 "
                  dir="auto"
                >
                  {message.content}
                </p>
              )}
            </div>

            <div
              className={`flex items-end my-0.5 gap-2 ${isMyMessage ? "flex-row" : "flex-row-reverse"}`}
            >
              {isReacted && (
                <div
                  className={`flex gap-1 ${isMyMessage ? "dark:text-white text-gray-700" : "dark:text-gray-800 text-gray-700"}`}
                >
                  {sortedReactions.map(([type, details]) => {
                    return (
                      <Reaction
                        key={type}
                        type={type}
                        symbol={details.symbol}
                        count={details.count}
                        reactors={details.reactors}
                      />
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <ChatBubbleStatus
                  readers={readers}
                  senderId={message.sender.id || message.senderId}
                  status={message.status}
                />

                <span
                  className={`text-xs block ${isMyMessage ? "text-white text-left" : "text-gray-400 text-right"}`}
                >
                  {messageDate}
                </span>
                {message.edit && (
                  <span
                    className={`text-xs block ${isMyMessage ? "text-white text-right" : "text-gray-500"}`}
                  >
                    {translations.ChatBubble[language].Edited}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  },
);
