import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const fetchMessageReaders = async (messageId, conversationId) => {
  const response = await api.get(
    `/conversations/${conversationId}/messages/${messageId}/readers`,
  );

  return response.data;
};

export function useMessageReader(messageId, conversationId) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["readers", messageId],
    queryFn: () => fetchMessageReaders(messageId, conversationId),
  });

  const readers = data ? data.readers : [];

  return { readers, isFetching, error };
}
