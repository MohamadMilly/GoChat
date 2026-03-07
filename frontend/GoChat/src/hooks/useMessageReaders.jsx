import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const fetchMessageReaders = async (messageId, conversationId, userId) => {
  const response = await api.get(
    `/conversations/${conversationId}/messages/${messageId}/readers`,
    {
      params: {
        userId: userId,
      },
    },
  );

  return response.data;
};

export function useMessageReader(messageId, conversationId) {
  const { user } = useAuth();
  const { data, isFetching, error } = useQuery({
    queryKey: ["readers", messageId],
    queryFn: () =>
      fetchMessageReaders(messageId, conversationId, user?.id || null),
  });

  const readers = data ? data.readers : [];

  return { readers, isFetching, error };
}
