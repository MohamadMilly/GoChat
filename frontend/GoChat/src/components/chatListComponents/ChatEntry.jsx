import { Avatar } from "../chat/Avatar";

export function ChatEntry({
  chatAvatar,
  isGroup,
  chatTitle,
  lastMessage = "",
  onOpenChat,
  isConnected,
}) {
  return (
    <li>
      <button
        onClick={onOpenChat}
        className="w-full flex items-center gap-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
      >
        <div className="shrink-0">
          <Avatar avatar={chatAvatar} chatTitle={chatTitle} />
          {!isGroup && (
            <span
              className={`absolute w-3 h-3 bottom-1 right-1 rounded-full border-2 border-white ${isConnected ? "bg-cyan-600" : "bg-gray-400"}`}
            ></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-x-2">
            <strong className="text-gray-900 truncate">{chatTitle}</strong>
            <span className="text-xs text-gray-400">{lastMessage?.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : ""}</span>
          </div>
          <p className="text-gray-600 text-sm truncate mt-1">{lastMessage?.content || ""}</p>
        </div>
      </button>
    </li>
  );
}
