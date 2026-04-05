import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

async function leaveConversation(conversationId) {
  const response = await api.delete(`/conversations/${conversationId}`);

  return response.data;
}

export function useLeaveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveConversation,
    mutationKey: "leave conversation",
    onMutate: async (conversationId) => {
      const queryKey = ["conversations"];
      await queryClient.cancelQueries(queryKey);
      const prevConversations = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.conversations) return;
        return {
          ...old,
          conversations: old.conversations.filter(
            (c) => c.id != conversationId,
          ),
        };
      });

      return { prevConversations };
    },

    onError: (_err, conversationId, context) => {
      queryClient.setQueryData(["conversations"], context.prevConversations);
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
        exact: true,
      });
    },
  });
}
