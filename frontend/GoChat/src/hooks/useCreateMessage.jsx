import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

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
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, args, context) => {
      const conversationId = args.conversationId;
      queryClient.setQueryData(["conversation", conversationId], (old) => {
        return { ...old, messages: [...old.messages, data.message] };
      });
    },
    onSettled: (data, error, args) => {
      queryClient.invalidateQueries(["conversation", args.conversationId]);
    },
  });
}
