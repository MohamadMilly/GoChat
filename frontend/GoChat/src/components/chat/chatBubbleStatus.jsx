import { Check, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function ChatBubbleStatus({ readers, senderId, status }) {
  const { user } = useAuth();
  const isMyMessage = user.id === senderId;
  const readersWithOutMe = readers.filter((id) => id != user.id);

  if (!isMyMessage) return null;

  if (status === "pending")
    return (
      <span>
        <Clock size={12} />
      </span>
    );

  if (readers && readersWithOutMe.length > 0)
    return (
      <span>
        <CheckCheck size={12} />
      </span>
    );

  return <Check size={12} />;
}
