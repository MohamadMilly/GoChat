import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
const sendMessage = async ({
  content,
  type,
  fileURL,
  mimeType,
  conversationId,
}) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    content,
    type,
    fileURL,
    mimeType,
  });
  return response.data;
};

export function useCreateMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (args) => {
      const conversationId = args.conversationId;
      await queryClient.cancelQueries([
        "messages",
        "conversation",
        conversationId,
      ]);
      const oldMessages = queryClient.getQueryData([
        ["messages", "conversation", conversationId],
      ]);
      queryClient.setQueryData(
        ["conversation", "messages", conversationId],
        (old) => {
          return {
            ...old,
            messages: [
              ...old.messages,
              { createdAt: new Date(), sender: user, ...args },
            ],
          };
        },
      );
      return { oldMessages };
    },
    onError: (error, args, context) => {
      queryClient.setQueryData(
        ["messages", "conversation", args.conversationId],
        context.oldMessages,
      );
    },
    onSettled: (data, error, args, context) => {
      queryClient.invalidateQueries([
        "conversation",
        "messages",
        args.conversationId,
      ]);
    },
  });
}
