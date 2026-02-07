import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const fetchMessages = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

export function useMessages(conversationId) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["conversation", "messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });
  const messages = data ? data.messages : null;
  const type = data ? data.type : null;
  return { messages, type, error, isFetching };
}
