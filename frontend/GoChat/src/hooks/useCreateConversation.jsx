import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useConversationContext } from "../contexts/ConversationContext";

const createConversation = async ({
  participants,
  type,
  avatar,
  title,
  description,
}) => {
  const response = await api.post("/conversations", {
    participants,
    type,
    avatar: avatar || undefined,
    title: title || undefined,
    description: description || undefined,
  });
  return response.data;
};

export function useCreateConversation() {
  const { setConversation } = useConversationContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      setConversation(data.conversation);
      queryClient.setQueryData(
        ["conversation", data.conversation.id],
        data.conversation,
      );
    },
    onError: (error) => {
      console.error("mutation failed: ", error);
    },
  });
}
