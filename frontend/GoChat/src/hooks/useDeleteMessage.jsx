import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

const deleteMessage = async ({ messageId, conversationId }) => {
  const response = await api.delete(
    `/conversations/${conversationId}/messages/${messageId}`,
  );
  return response.data;
};

function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    mutationKey: "delete message",
    onMutate: async ({ messageId, conversationId }) => {
      await queryClient.cancelQueries([
        "messages",
        "conversation",
        conversationId,
      ]);

      const previousMessages = queryClient.getQueryData([
        "messages",
        "conversation",
        conversationId,
      ]);
    },
  });
}
