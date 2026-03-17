import { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatPageContext } from "../../routes/ChatPage";
import { socket } from "../../socket";
export function ChatBubbleMenu({ message, clickCoords, menuRef }) {
  const { setEditedMessage, conversationId } = useContext(ChatPageContext);
  const queryClient = useQueryClient();
  const { x, y } = clickCoords;

  const handleDeleteMessage = (messageId, conversationId) => {
    if (!messageId || !conversationId) return;
    let newMessages = [];
    let previousMessages = queryClient.getQueryData([
      "conversation",
      "messages",
      conversationId,
    ]).messages;

    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old.messages) return old;
        newMessages = old.messages.filter(
          (message) => message.id !== messageId,
        );
        return {
          ...old,
          messages: newMessages,
        };
      },
    );
    queryClient.setQueryData(["conversations"], (old) => {
      if (!old.conversations) return old;

      return {
        ...old,
        conversations: old.conversations.map((c) => {
          if (c.id == conversationId && c.messages[0].id === messageId) {
            return { ...c, messages: [newMessages[newMessages.length - 1]] };
          } else {
            return c;
          }
        }),
      };
    });
    socket
      .timeout(5000)
      .emit("delete message", messageId, conversationId, (err, response) => {
        if (err || response.status !== "ok") {
          console.error(
            "An error happened while deleting the message:",
            messageId,
            "status:",
            response.status,
          );
          queryClient.setQueryData(
            ["conversation", "messages", conversationId],
            (old) => {
              if (!old.messages) return old;

              return {
                ...old,
                messages: previousMessages,
              };
            },
          );
          queryClient.setQueryData(["conversations"], (old) => {
            if (!old.conversations) return old;
            return {
              ...old,
              conversations: old.conversations.map((c) => {
                if (c.id == conversationId) {
                  return {
                    ...c,
                    messages: [previousMessages[previousMessages.length - 1]],
                  };
                }
                return c;
              }),
            };
          });
          return;
        }
      });
  };

  return (
    <div
      ref={menuRef}
      style={{
        "--x": Math.floor(x) + "px",
        "--y": Math.floor(y) + "px",
      }}
      className="h-fit z-10 animate-pop transition-all delay-300 duration-300 w-30 fixed -translate-x-1/3 left-[var(--x)] top-[var(--y)] dark:bg-gray-700 bg-gray-100 rounded-md overflow-hidden"
    >
      <button
        className="text-sm dark:text-gray-200 text-gray-600 cursor-pointer w-full p-2 hover:bg-gray-200 hover:text-gray-700"
        onClick={() => handleDeleteMessage(message.id, conversationId)}
      >
        Delete
      </button>
      <button
        onClick={() => setEditedMessage(message)}
        className="text-sm dark:text-gray-200 text-gray-600 cursor-pointer w-full p-2 hover:bg-gray-200 hover:text-gray-700"
      >
        Edit
      </button>
    </div>
  );
}
