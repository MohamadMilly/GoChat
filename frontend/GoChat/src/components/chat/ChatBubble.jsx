import {
  useRef,
  useState,
  useEffect,
  createContext,
  memo,
  useContext,
  useCallback,
} from "react";
import { Avatar } from "./Avatar";
import { TransitionLink } from "../ui/TransitionLink";
import { Braces, FileText, FileArchive, CodeXml, File } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../socket";
import { ChatBubbleStatus } from "./chatBubbleStatus";
import { ReadersMenu } from "./ReadersMenu";
import { ChatPageContext } from "../../routes/ChatPage";
import Button from "../ui/Button";
import { useSearchParams } from "react-router";

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

function ImageFile({ mimeType, fileURL }) {
  const { setIsInPreviewMode, setPreviewImageURL } =
    useContext(ChatPageContext);
  const handlePreview = (fileURL) => {
    setIsInPreviewMode(true);
    setPreviewImageURL(fileURL);
  };
  return (
    <div className="p-0.5 rounded-xl max-w-md overflow-hidden relative group">
      <span className="absolute top-3 left-3 text-xs text-gray-400 bg-gray-50/10 backdrop-blur-xs rounded z-10">
        {mimeType.split("/")[1].toUpperCase()}
      </span>
      <div className="group-hover:opacity-100 opacity-0 z-10 absolute rounded-xl inset-0.5 bg-gray-900/30 backdrop-blur-xs transition-all duration-300">
        <button
          onClick={() => handlePreview(fileURL)}
          className="w-full h-full text-2xl text-gray-50 cursor-pointer tracking-tight"
        >
          Click to preview
        </button>
      </div>
      <img
        className="h-auto rounded-xl object-cover block cursor-pointer w-full"
        src={fileURL}
        alt="Sended Message image"
        loading="lazy"
      />
    </div>
  );
}

function MediaFilePreview({ fileURL, mimeType }) {
  if (!fileURL) return null;
  if (mimeType.includes("image")) {
    return <ImageFile fileURL={fileURL} mimeType={mimeType} />;
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
    const { setRepliedMessage } = useContext(ChatPageContext);
    const [searchParams, setSearchParams] = useSearchParams();
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
    const handleReply = useCallback(
      (message) => {
        setRepliedMessage(message);
        setSearchParams({ reply: message?.id || message.createdAt });
      },
      [setRepliedMessage, setSearchParams],
    );
    useEffect(() => {
      const container = messagesContainerRef.current;
      const content = messageContentContainerRef.current;

      if (!container || !content) return;

      let hasTriggered = false;
      let startX = 0;

      const handleMove = (currentX) => {
        const diffX = startX - currentX;
        container.style.transition = "none";
        if (diffX > 0 && diffX < 150) {
          container.style.right = diffX + "px";
        }

        if (diffX > 100 && !hasTriggered) {
          handleReply(message);
          hasTriggered = true;
        }
      };

      const handleEnd = () => {
        container.style.right = "0px";
        container.style.transition = "all 0.3s ease";
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

      content.addEventListener("mousedown", handleStart);
      content.addEventListener("touchstart", handleStart);

      return () => {
        content.removeEventListener("mousedown", handleStart);
        content.removeEventListener("touchstart", handleStart);
      };
    }, [message, handleReply]);

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
          className={`my-1 will-change-auto relative flex items-end gap-1 text-sm md:text-base animate-pop transition-all duration-300 ${hideAvatar && isGroupMessage ? "pl-12" : ""} ${isReadersVisible && "bg-cyan-300/40"}`}
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
            className={`w-fit max-w-[85%] md:max-w-[75%] ${isMyMessage ? "ml-auto" : ""}`}
          >
            {message.type !== "TEXT" && (
              <MediaFilePreview
                fileURL={message.fileURL}
                mimeType={message.mimeType}
              />
            )}
            <div
              onClick={handleShowReaders}
              ref={messageContentContainerRef}
              className={`relative w-full px-2 py-1 font-rubik rounded-t-xl ${isMyMessage ? "bg-cyan-700 rounded-br-none rounded-bl-xl text-gray-100" : "bg-gray-100 text-gray-600 rounded-bl-none rounded-br-xl"} cursor-grab`}
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
                  <div
                    className={`px-2 border border-cyan-400 max-w-80 min-w-50 py-0.5 my-0.5 rounded flex flex-col gap-0.5 ${isMyMessage ? "bg-cyan-500/50" : "bg-cyan-200/15"} shadow-cyan-300/40 shadow-inner`}
                  >
                    <strong className="text-sm">
                      {message.repliedMessage.sender.id === user.id
                        ? "You"
                        : message.repliedMessage.sender.firstname +
                          " " +
                          message.repliedMessage.sender.lastname}
                    </strong>
                    <p className="text-xs line-clamp-2">
                      {message.repliedMessage.content}
                    </p>
                  </div>
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
              {user.id === message.senderId && (
                <>
                  <ReadersMenu />
                </>
              )}
            </div>
          </div>
        </li>
      </ChatBubbleContext>
    );
  },
);
