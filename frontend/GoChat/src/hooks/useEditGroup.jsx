import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { socket } from "../socket";

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
        if (!old?.conversations) return old;
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
    /* 
    BIG CHALLENGE HERE , PROBABLY I WILL TACKLE IT LATER */
    /*
    onSuccess: (data, args, context) => {
      const participantsIds = args.data.participants.map((p) => p.userId);
      console.log(participantsIds);
      const conversationId = data.conversation.id.toString();
      socket
        .timeout(4000)
        .emit(
          "edit conversation",
          participantsIds,
          conversationId,
          (response) => {
            if (response?.status !== "ok") {
              console.error("Error emitting group event: ", response?.status);
            }
          },
        );
    },
    */
    onError: (_err, args, context) => {
      console.log(_err);
      const lastMessage = queryClient
        .getQueryData(["conversations"])
        ?.conversations.find((c) => c.id == args.conversationId).messages[0];
      queryClient.setQueryData(["conversation", args.conversationId], (old) => {
        return context?.previousConversationInfo;
      });
      queryClient.setQueryData(["conversaitons"], (old) => {
        if (!old?.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((c) => {
            if (c.id == args.conversationId) {
              return {
                ...context?.previousConversationInChatEntry,
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
