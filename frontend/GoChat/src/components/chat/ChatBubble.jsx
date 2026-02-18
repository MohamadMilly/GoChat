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
    <video className="w-100 h-auto m-1 rounded" controls>
      <source src={link} type="video/mp4" />
      <source src={link} type="video/ogg"></source>
      Your browser does not support the video tag.
    </video>
  );
}

function FileItem({ icon, link, colors = {}, label = "File" }) {
  const textClass = colors.text || "text-gray-500";
  const bgClass = colors.bg || "bg-gray-200";

  return (
    <div className="w-100 h-30 bg-gray-50 border px-6 border-gray-300 rounded flex items-center justify-center gap-x-6 m-1">
      <div
        className={`${textClass} ${bgClass} w-20 h-20 rounded-full shrink-0 flex justify-center items-center`}
      >
        {icon}
      </div>

      <div className="flex-1 bg-gray-100/50 flex flex-col items-start border border-gray-100 h-full py-6 px-4">
        <p className="text-sm text-gray-700">
          <a href={link}>{label}</a>
        </p>
      </div>
    </div>
  );
}

function MediaFilePreview({ fileURL, mimeType }) {
  if (!fileURL) return null;
  if (mimeType.includes("image")) {
    return (
      <div className="p-2 rounded relative">
        <span className="absolute top-3 left-3 text-xs text-gray-900">
          {mimeType.split("/")[1].toUpperCase()}
        </span>
        <img
          className="w-100 h-auto rounded object-cover"
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
            className={`relative w-fit max-w-5/6 md:max-w-3/4 px-2 py-1 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 ml-auto rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 rounded-bl-none rounded-br-xl"}`}
          >
            <div className="flex flex-col">
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
