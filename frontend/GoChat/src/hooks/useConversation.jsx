import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

export function useConversation(conversationId) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  });
  const conversation = data ? data.conversation : null;
  return { conversation, isFetching, error };
}
