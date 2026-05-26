import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../../socket";
import { supabase } from "../../utils/supabase";
import { toast } from "react-toastify";

let counter = 0;

export function useSendMessage() {
  const queryClient = useQueryClient();
  const sendMessage = async (messageData, user, conversationId) => {
    const client_offset = `${socket.id}-${++counter}`;
    const now = new Date();
    const message = messageData.message;
    const repliedMessage = messageData.repliedMessage;
    const mediaFileData = messageData.mediaFileData;

    const optimisticMessage = {
      createdAt: now,
      sender: user,
      content: message,
      file: mediaFileData.file,
      fileURL: messageData.previewFileURL,
      mimeType: mediaFileData?.mimeType || "text/plain",
      type: mediaFileData.mimeType
        ? mediaFileData.mimeType.includes("image")
          ? "IMAGE"
          : "FILE"
        : "TEXT",
      status: "pending",
      repliedMessage: repliedMessage,
      reactions: [],
    };

    queryClient.setQueryData(
      ["conversation", "messages", conversationId],
      (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                messages: [...page.messages, optimisticMessage],
              };
            } else {
              return page;
            }
          }),
        };
      },
    );

    queryClient.setQueryData(["conversations"], (old) => {
      if (!old?.conversations) return old;
      return {
        ...old,
        conversations: old.conversations.map((c) => {
          if (c.id == conversationId) {
            return {
              ...c,
              messages: [optimisticMessage],
            };
          } else {
            return c;
          }
        }),
      };
    });

    try {
      let finalFileURL = "";

      if (messageData.mediaFileData.file) {
        const { data, error } = await supabase.storage
          .from("files")
          .upload(
            `${Date.now()}-${crypto.randomUUID()}`,
            messageData.mediaFileData.file,
          );

        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from("files")
          .getPublicUrl(data.path);
        finalFileURL = publicUrlData.publicUrl;
      }

      socket.timeout(5000).emit(
        "chat message",
        {
          createdAt: optimisticMessage.createdAt,
          content: messageData.message,
          fileURL: finalFileURL,
          mimeType: messageData.mediaFileData?.mimeType || "text/plain",
          type: finalFileURL
            ? messageData.mediaFileData.mimeType.includes("image")
              ? "IMAGE"
              : "FILE"
            : "TEXT",
          repliedMessageId: messageData.repliedMessage?.id || null,
          reactions: [],
        },
        String(conversationId),
        client_offset,
        (err, response) => {
          if (err) {
            console.error(
              `Message delivery timed out for offset ${client_offset}:`,
              err.message,
            );
            // Optional: Add logic to retry emission or flag message state in DB
            return;
          }

          if (response?.status !== "ok") {
            console.error(
              `Client rejected message: Status (${response?.status || "unknown"}) - ${response?.error || "No error details provided"}`,
            );
          } else {
            console.log(
              `Message successfully delivered and acknowledged for offset: ${client_offset}`,
            );
          }
        },
      );
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.message);
    }
  };

  return sendMessage;
}
