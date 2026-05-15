import { Check, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { memo } from "react";

export const ChatBubbleStatus = memo(function ChatBubbleStatus({
  readers,
  senderId,
  status,
  className,
  supportNotifications = false,
  unReadMessagesCount,
}) {
  const { user } = useAuth();
  const isMyMessage = user.id === senderId;
  const actualReaders = isMyMessage
    ? readers.filter((id) => id != user.id)
    : readers;

  if (!isMyMessage && !supportNotifications) return;
  return (
    <div>
      <span className={className}>
        {isMyMessage ? (
          status === "pending" ? (
            <Clock size={12} />
          ) : readers && actualReaders.length > 0 ? (
            <CheckCheck size={12} />
          ) : (
            <Check size={12} />
          )
        ) : unReadMessagesCount > 0 && supportNotifications ? (
          <span className=" h-4 w-4 flex justify-center items-center  rounded-full bg-cyan-500 text-white">
            {unReadMessagesCount}
          </span>
        ) : null}
      </span>
    </div>
  );
});
