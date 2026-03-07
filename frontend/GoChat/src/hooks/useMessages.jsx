import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const fetchMessages = async (conversationId, userId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: { userId: userId },
  });
  return response.data;
};

export function useMessages(conversationId) {
  const { user } = useAuth();
  const { data, isFetching, error } = useQuery({
    queryKey: ["conversation", "messages", conversationId],
    queryFn: () => fetchMessages(conversationId, user?.id || null),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5,
  });
  const messages = data ? data.messages : null;
  const type = data ? data.type : null;
  return { messages, type, error, isFetching };
}
