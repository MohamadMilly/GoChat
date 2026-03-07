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
      const previousConversationInChatEntry = queryClient.getQueryData([
        "conversations",
      ]);
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

      queryClient.setQueryData(["conversations"], (old) => {
        if (!old.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == conversationId) {
              return {
                ...c,
                ...data,
              };
            }
            return c;
          }),
        };
      });
      return { previousConversationInfo, previousConversationInChatEntry };
    },
    onError: (_err, args, context) => {
      const lastMessage = queryClient
        .getQueryData(["conversations"])
        .conversations.find((c) => c.id == args.conversationId).messages[0];
      queryClient.setQueryData(["conversation", args.conversationId], (old) => {
        return context.previousConversationInfo;
      });
      queryClient.setQueryData(["conversaitons"], (old) => {
        if (!old.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == args.conversationId) {
              return {
                ...context.previousConversationInChatEntry,
                messages: [lastMessage],
              };
            } else {
              return c;
            }
          }),
        };
      });
    },
  });
}
