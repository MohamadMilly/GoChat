import { Check, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function ChatBubbleStatus({
  readers,
  senderId,
  status,
  className,
  supportNotifications = false,
}) {
  const { user } = useAuth();
  const isMyMessage = user.id === senderId;
  const readersWithOutMe = readers.filter((id) => id != user.id);

  const isReadByMe = readers.includes(user.id);
  if (!isMyMessage && !supportNotifications) return;
  return (
    <div>
      <span className={className}>
        {isMyMessage ? (
          status === "pending" ? (
            <Clock size={12} />
          ) : readers && readersWithOutMe.length > 0 ? (
            <CheckCheck size={12} />
          ) : (
            <Check size={12} />
          )
        ) : !isReadByMe && supportNotifications ? (
          <span className="block w-2 h-2 rounded-full bg-cyan-500"></span>
        ) : null}
      </span>
    </div>
  );
}
