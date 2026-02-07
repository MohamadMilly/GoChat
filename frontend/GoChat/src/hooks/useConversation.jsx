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
    staleTime: 1000 * 60 * 5,
  });
  const conversation = data ? data.conversation : null;
  const membersCount = data ? data.membersCount : null;
  return { conversation, isFetching, error, membersCount };
}
