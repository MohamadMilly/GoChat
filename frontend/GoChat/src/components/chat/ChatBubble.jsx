import { useRef, useState, useEffect, createContext, memo } from "react";
import { Avatar } from "./Avatar";
import { TransitionLink } from "../ui/TransitionLink";
import { Braces, FileText, FileArchive, CodeXml, File } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../socket";
import { ChatBubbleStatus } from "./chatBubbleStatus";
import { ReadersMenu } from "./ReadersMenu";

function VideoFile({ link }) {
  return (
    <div className="w-full max-w-[28rem] mx-0 my-1">
      <video className="w-full h-auto max-h-[40vh] rounded" controls>
        <source src={link} type="video/mp4" />
        <source src={link} type="video/ogg"></source>
        Your browser does not support the video tag.
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

function MediaFilePreview({ fileURL, mimeType }) {
  if (!fileURL) return null;
  if (mimeType.includes("image")) {
    return (
      <div className="p-0.5 rounded relative max-w-[28rem] overflow-hidden">
        <span className="absolute top-3 left-3 text-xs text-gray-900 z-10">
          {mimeType.split("/")[1].toUpperCase()}
        </span>
        <img
          className="w-full h-auto rounded object-cover block"
          src={fileURL}
          alt="Sended Message image"
        />
      </div>
    );
  }
  if (mimeType.includes("application")) {
    if (mimeType.includes("json")) {
      return (
        <FileItem
          icon={<Braces size={30} />}
          link={fileURL}
          colors={{ text: "text-yellow-300", bg: "bg-yellow-100" }}
          label="JSON File"
        />
      );
    } else if (mimeType.includes("pdf")) {
      return (
        <FileItem
          icon={<FileText size={30} />}
          link={fileURL}
          colors={{ text: "text-red-500", bg: "bg-red-200" }}
          label="PDF File"
        />
      );
    } else if (mimeType.includes("zip")) {
      return (
        <FileItem
          icon={<FileArchive size={30} />}
          link={fileURL}
          colors={{ text: "text-yellow-300", bg: "bg-yellow-100" }}
          label="ZIP File"
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
      label="File"
    />
  );
}

export const ChatBubbleContext = createContext({
  messageId: null,
  isInPreview: false,
  clickYCoords: null,
  isFadeRunning: false,
});

export const ChatBubble = memo(
  ({
    message,
    isGroupMessage,
    isMyMessage,
    hideAvatar = false,
    hideName = false,
  }) => {
    const { user } = useAuth();
    const readersIds = message.readers
      ? message.readers.map((reader) => reader.id)
      : [];

    const [readers, setReaders] = useState(readersIds);
    const [isReadersVisible, setIsReadersVisible] = useState(false);
    const [clickYCoords, setClickYCoords] = useState(null);
    const [transitionId, setTransitionId] = useState(null);
    const [isFadeRunning, setIsFadeRunning] = useState(false);
    const messagesContainerRef = useRef(null);
    const messageContentContainerRef = useRef(null);
    const fullname = message.sender.firstname + " " + message.sender.lastname;

    const isThereAvatar = !!message.sender.profile?.avatar;
    const avatar = isThereAvatar && message.sender.profile?.avatar;
    const color = message.sender?.accountColor || "";

    const handleShowReaders = (e) => {
      setIsReadersVisible(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      setClickYCoords(y);
    };

    useEffect(() => {
      function onReadMessage(messageId, userId) {
        if (messageId !== message.id) return;

        setReaders((prev) => [...prev, userId]);
      }
      socket.on("read message", onReadMessage);

      return () => {
        socket.off("read message", onReadMessage);
      };
    }, [message.id]);

    useEffect(() => {
      if (!messagesContainerRef.current) return;
      const observer = new IntersectionObserver((entries) => {
        const observedMessage = entries[0];
        const isReadByMe = readers.some((id) => id === user.id);

        if (
          observedMessage.isIntersecting &&
          !isReadByMe &&
          message.status !== "pending"
        ) {
          socket.emit("read message", message.id, user.id);
          console.log("message is being read");
        }
      });
      const observedMessage = messagesContainerRef.current;
      observer.observe(observedMessage);
      return () => {
        if (!observedMessage) return;
        observer.unobserve(observedMessage);
      };
    }, [message.id, user.id, message.status, readers]);

    useEffect(() => {
      let timer;
      function handleClickOutside(event) {
        if (
          isReadersVisible &&
          messageContentContainerRef.current &&
          !messageContentContainerRef.current.contains(event.target)
        ) {
          setIsFadeRunning(true);
          timer = setTimeout(() => {
            setIsFadeRunning(false);
            setIsReadersVisible(false);
          }, 300);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        clearTimeout(timer);
      };
    }, [isReadersVisible]);

    return (
      <ChatBubbleContext
        value={{
          messageId: message.id,
          isReadersVisible: isReadersVisible,
          isFadeRunning: isFadeRunning,
          clickYCoords: clickYCoords,
        }}
      >
        <li
          ref={messagesContainerRef}
          className={`my-1 flex items-end gap-1 text-sm md:text-base animate-pop transition-all duration-300 ${hideAvatar && isGroupMessage ? "pl-12" : ""} ${isReadersVisible && "bg-cyan-300/40"}`}
        >
          {isGroupMessage && !isMyMessage && !hideAvatar && (
            <TransitionLink
              route={`/users/${message.sender.id}`}
              setDynamicTransitionId={setTransitionId}
            >
              <Avatar
                avatar={avatar}
                chatTitle={fullname}
                color={color}
                dynamicTransitionId={transitionId}
                size="42px"
              />
            </TransitionLink>
          )}
          <div
            onClick={handleShowReaders}
            ref={messageContentContainerRef}
            className={`relative w-fit max-w-[85%] md:max-w-[75%] px-3 py-2 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 ml-auto rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 rounded-bl-none rounded-br-xl"}`}
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
              {message.type !== "TEXT" && (
                <MediaFilePreview
                  fileURL={message.fileURL}
                  mimeType={message.mimeType}
                />
              )}
              {message.content && (
                <p className="wrap-break-word whitespace-pre-wrap" dir="auto">
                  {message.content}
                </p>
              )}
            </div>
            {message.edit && (
              <span
                className={`text-xs block ${isMyMessage ? "text-white text-right" : "text-gray-500"}`}
              >
                edited
              </span>
            )}
            <div className="flex items-center gap-2">
              <ChatBubbleStatus
                readers={readers}
                senderId={message.sender.id || message.senderId}
                status={message.status}
              />

              <span
                className={`text-xs block ${isMyMessage ? "text-white text-left" : "text-gray-400 text-right"}`}
              >
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            {user.id === message.senderId && <ReadersMenu />}
          </div>
        </li>
      </ChatBubbleContext>
    );
  },
);
