import { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatPageContext } from "../../routes/ChatPage";
import { socket } from "../../socket";
import { ReadersMenu } from "./ReadersMenu";
import { useState } from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

const reactions = [
  {
    symbol: "👍",
    type: "LIKE",
  },
  {
    symbol: "❤️",
    type: "LOVE",
  },

  {
    symbol: "🤣",
    type: "LAUGH",
  },
  {
    symbol: "😡",
    type: "ANGER",
  },
];

function ReactionButton({
  reaction,
  delay,
  messageId,
  conversationId,
  userId,
  setMessage,
}) {
  const queryClient = useQueryClient();

  const handleReact = (messageId, userId, conversationId, type) => {
    const optimisticDate = new Date();
    const queryKey = ["conversation", "messages", conversationId];

    const optimisticReaction = {
      reactedAt: optimisticDate,
      type: reaction.type,
      reactorId: userId,
      conversationId: Number(conversationId),
      messageId: messageId,
      status: "pending",
    };

    queryClient.setQueryData(queryKey, (old) => {
      if (!old?.pages) return old;
      const updatedPages = old.pages.map((page) => ({
        ...page,
        messages: page.messages.map((message) => {
          if (message.id === messageId) {
            const isReactedByMe = message.reactions.some(
              (r) => r.reactorId === userId,
            );

            return {
              ...message,
              reactions: isReactedByMe
                ? message.reactions.flatMap((reaction) => {
                    if (reaction.reactorId === userId) {
                      if (reaction.type === type) {
                        return [];
                      } else {
                        return [optimisticReaction];
                      }
                    }

                    return [reaction];
                  })
                : [...message.reactions, optimisticReaction],
            };
          }
          return message;
        }),
      }));
      return {
        ...old,
        pages: updatedPages,
      };
    });
    socket
      .timeout(5000)
      .emit(
        "reaction",
        messageId,
        userId,
        conversationId,
        type,
        (err, response) => {
          if (err) {
            console.error("Request timed out");
            queryClient.setQueryData(queryKey, (old) => {
              if (!old?.pages) return old;
              const updatedPages = old.pages.map((page) => ({
                ...page,
                messages: page.messages.filter((message) => {
                  const messageDate = new Date(message.reactedAt);
                  return messageDate.getTime() !== optimisticDate.getTime();
                }),
              }));
              return {
                ...old,
                pages: updatedPages,
              };
            });
          }
          if (response?.status !== "ok") {
            console.error(
              "Reaction Error:",
              response?.message || response?.status,
            );
          }
        },
      );
    setMessage(null);
  };
  return (
    <Button
      onClick={() =>
        handleReact(messageId, userId, conversationId, reaction.type)
      }
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
      className={`rounded-full! animate-slideRight 
          w-8! h-8! flex justify-center items-center`}
    >
      {reaction.symbol}
    </Button>
  );
}

function ReactionsBar({
  reactions,
  messageId,
  userId,
  conversationId,
  setMessage,
}) {
  return (
    <div className="flex gap-1 w-40 p-0.5 my-1 mx-auto bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-800 rounded-full">
      {reactions.map((reaction, index) => {
        return (
          <ReactionButton
            setMessage={setMessage}
            delay={index * 150}
            reaction={reaction}
            messageId={messageId}
            userId={userId}
            conversationId={conversationId}
          />
        );
      })}
    </div>
  );
}

export function ChatBubbleMenu({
  message,
  setMessage,
  clickCoords,
  menuRef,
  isCurrentUserMessage,
  isCurrentUserAdmin,
}) {
  const { setEditedMessage, conversationId } = useContext(ChatPageContext);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { x, y } = clickCoords;
  const [readersVisible, setReadersVisible] = useState(false);
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
        if (!old?.pages) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((message) => message.id !== messageId),
        }));

        newMessages = updatedPages.flatMap((page) => page.messages);

        return {
          ...old,
          pages: updatedPages,
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
    setMessage(null);
  };

  return (
    <div
      ref={menuRef}
      style={{
        "--x": Math.floor(x) + "px",
        "--y": Math.floor(y) + "px",
      }}
      className="h-fit z-10 animate-pop transition-all delay-300 duration-300 w-45 fixed md:-translate-x-full -translate-y-1/2 md:left-[var(--x)] left-1/2 -translate-x-1/2 top-[var(--y)] "
    >
      <ReactionsBar
        setMessage={setMessage}
        reactions={reactions}
        messageId={message.id}
        conversationId={conversationId}
        userId={user.id}
      />
      <div className="dark:bg-gray-700 bg-gray-100 rounded-md overflow-hidden">
        <div>
          <Button
            className={"flex items-center gap-1 w-full m-1"}
            onClick={() => setReadersVisible(!readersVisible)}
          >
            {readersVisible ? (
              <ArrowBigLeft size={16} />
            ) : (
              <ArrowBigRight size={16} />
            )}
            {!readersVisible && <span>Readers</span>}
          </Button>
          {readersVisible && <ReadersMenu messageId={message.id} />}
        </div>
        {(isCurrentUserAdmin || isCurrentUserMessage) && (
          <button
            className="text-sm dark:text-gray-200 text-gray-600 cursor-pointer w-full p-2 hover:bg-gray-200 hover:text-gray-700"
            onClick={() => handleDeleteMessage(message.id, conversationId)}
          >
            Delete
          </button>
        )}
        {isCurrentUserMessage && (
          <button
            onClick={() => setEditedMessage(message)}
            className="text-sm dark:text-gray-200 text-gray-600 cursor-pointer w-full p-2 hover:bg-gray-200 hover:text-gray-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
