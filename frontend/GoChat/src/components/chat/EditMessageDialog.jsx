import { useLanguage } from "../../contexts/LanguageContext";
import { MediaFilePreview } from "./ChatBubble";
import translations from "../../translations";
import { useContext, useRef, useState } from "react";
import { ChatPageContext } from "../../routes/ChatPage";
import Button from "../ui/Button";
import { ArrowLeft, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../../socket";
export function EditMessageDialog() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { setEditedMessage, editedMessage, conversationId } =
    useContext(ChatPageContext);
  const initialContent = editedMessage ? editedMessage.content : "";
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    let oldMessage = editedMessage;
    let newMessages = [];

    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old?.pages) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((message) => {
            if (message.id === editedMessage.id) {
              return {
                ...message,
                content: content,
                edit: true,
              };
            }
            return message;
          }),
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
          if (c.id == conversationId && c.messages[0].id === editedMessage.id) {
            return { ...c, messages: [newMessages[newMessages.length - 1]] };
          } else {
            return c;
          }
        }),
      };
    });
    socket
      .timeout(5000)
      .emit(
        "edit message",
        { ...editedMessage, content: content },
        conversationId,
        (err, response) => {
          if (err || response.status !== "ok") {
            console.error(
              "An error happened while deleting the message:",
              editedMessage.id,
              "status:",
              response.status,
            );
            queryClient.setQueryData(
              ["conversation", "messages", conversationId],
              (old) => {
                if (!old.messages) return old;

                return {
                  ...old,
                  messages: old.messages.map((message) => {
                    if (message.id === editedMessage.id) {
                      return oldMessage;
                    }
                    return message;
                  }),
                };
              },
            );
            queryClient.setQueryData(["conversations"], (old) => {
              if (!old.conversations) return old;

              return {
                ...old,
                conversations: old.conversations.map((c) => {
                  if (
                    c.id == conversationId &&
                    c.messages[0].id === editedMessage.id
                  ) {
                    return {
                      ...c,
                      messages: [oldMessage],
                    };
                  } else {
                    return c;
                  }
                }),
              };
            });
          }
        },
      );
    setEditedMessage("");
  };
  return (
    <dialog
      open={!!editedMessage}
      className="w-full py-6 z-100 h-full fixed inset-0 bg-white/20 backdrop-blur-sm dark:bg-gray-800/20"
    >
      <div className="px-4 mb-6">
        <Button
          className={"text-gray-600"}
          onClick={() => setEditedMessage(null)}
        >
          <span className="sr-only">Cancel</span>
          <ArrowLeft size={20} />
        </Button>
      </div>
      <div
        className={`my-1 overflow-y-auto max-h-[calc(100%-50px)] bg-cyan-600/10 px-4 relative text-sm md:text-base animate-pop transition-all duration-300`}
      >
        <div className={`w-fit max-w-[85%] md:max-w-[75%]`}>
          {editedMessage.type !== "TEXT" && (
            <MediaFilePreview
              editMode={true}
              fileURL={editedMessage.fileURL}
              mimeType={editedMessage.mimeType}
            />
          )}
          <div
            className={`group relative w-full px-2 py-1 font-rubik rounded-t-xl bg-cyan-700 dark:bg-cyan-600 rounded-br-none rounded-bl-xl text-gray-100`}
          >
            <div className="min-w-0 w-full">
              {editedMessage.content && (
                <p
                  className="wrap-break-word whitespace-pre-wrap dark:text-gray-200 "
                  dir="auto"
                >
                  {content}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs block text-white text-left `}>
                {new Date(editedMessage.createdAt).toLocaleTimeString()}
              </span>
              {editedMessage.edit && (
                <span className={`text-xs block text-white text-right`}>
                  {translations.ChatBubble[language].Edited}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleEditSubmit}
        className="max-w-200 z-10 dark:shadow shadow-inner dark:shadow-gray-600/20 shadow-gray-100/50 md:mx-auto mx-3 flex! items-center justify-center gap-2 fixed bottom-4 sm:bottom-8 md:bottom-12 right-0 left-0 p-4 dark:bg-gray-800 rounded-xl bg-gray-100/50 backdrop-blur-xs border-gray-300 text-gray-700 dark:border-gray-700 border dark:text-gray-100 animate-slideup"
      >
        <label htmlFor="content" className="sr-only">
          new content
        </label>
        <EditMessageTextArea onChange={handleContentChange} value={content} />
        <Button
          type="submit"
          className={"shrink-0 dark:text-green-400 text-green-600"}
        >
          <Check size={25} />
        </Button>
      </form>
    </dialog>
  );
}

function EditMessageTextArea({ value, onChange }) {
  const textAreaRef = useRef();

  return (
    <textarea
      ref={textAreaRef}
      id="content"
      className="grow outline-0 resize-none"
      placeholder="new content here ..."
      onChange={(e) => {
        const textarea = textAreaRef.current;
        onChange(e);
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
      }}
      value={value}
      name="content"
    ></textarea>
  );
}
