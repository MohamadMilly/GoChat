import { Check, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ReadersMenu } from "./ReadersMenu";

export function ChatBubbleStatus({ readers, senderId, status, className }) {
  const { user } = useAuth();
  const isMyMessage = user.id === senderId;
  const readersWithOutMe = readers.filter((id) => id != user.id);
  if (!isMyMessage) return null;

  return (
    <div>
      <span className={className}>
        {status === "pending" ? (
          <Clock size={12} />
        ) : readers && readersWithOutMe.length > 0 ? (
          <CheckCheck size={12} />
        ) : (
          <Check size={12} />
        )}
      </span>
    </div>
  );
}
