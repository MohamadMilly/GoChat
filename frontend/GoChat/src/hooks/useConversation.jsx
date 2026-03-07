import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const getConversation = async (conversationId, userId) => {
  const response = await api.get(`/conversations/${conversationId}`, {
    params: {
      userId: userId,
    },
  });
  return response.data;
};

export function useConversation(conversationId) {
  const { user } = useAuth();
  const { data, isFetching, error } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId, user?.id || null),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5,
  });
  const conversation = data ? data.conversation : null;
  const membersCount = data ? data.membersCount : null;
  return { conversation, isFetching, error, membersCount };
}
