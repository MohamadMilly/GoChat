import { useAuth } from "../../contexts/AuthContext";
import { ChatBubble } from "./ChatBubble";

export function MessagesList({ messages, type }) {
  const { user } = useAuth();

  return (
    <ul className="p-3 flex-1 overflow-y-auto">
      {messages.map((message) => {
        const sender = message.sender;
        const isMyMessage = user.id === sender.id;
        return (
          <ChatBubble
            sender={sender}
            createdAt={message.createdAt}
            editedAt={message.editedAt}
            content={message.content}
            isEdited={message.edit}
            isGroupMessage={type === "GROUP"}
            isMyMessage={isMyMessage}
            key={message.id}
          />
        );
      })}
    </ul>
  );
}
