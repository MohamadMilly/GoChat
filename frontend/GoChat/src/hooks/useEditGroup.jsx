import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

const updateGroup = async ({ conversationId, data }) => {
  const response = await api.put(`/conversations/${conversationId}`, data);

  return response.data;
};

export function useEditGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroup,
    mutationKey: ["update group"],
    onMutate: async ({ conversationId, data }) => {
      const queryKey = ["conversation", conversationId];
      await queryClient.cancelQueries(queryKey);

      const previousConversationInfo = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.conversation) return old;
        return {
          ...old,
          membersCount: data.participants?.length || 0,
          conversation: {
            ...old.conversation,
            ...data,
          },
        };
      });

      return { previousConversationInfo };
    },
    onError: (_err, args, context) => {
      queryClient.setQueryData(["conversation", args.conversationId], (old) => {
        return context.previousConversationInfo;
      });
    },
  });
}
