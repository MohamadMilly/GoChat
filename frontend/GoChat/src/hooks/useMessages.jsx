import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const fetchMessages = async (conversationId, userId, cursor) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: { userId: userId, cursor: cursor },
  });
  return response.data;
};

export function useMessages(conversationId) {
  const { user } = useAuth();
  const {
    data,
    isFetching,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversation", "messages", conversationId],
    queryFn: ({ pageParam = null }) =>
      fetchMessages(conversationId, user?.id || null, pageParam),
    enabled: !!conversationId,
    getNextPageParam: (lastpage) => {
      return lastpage?.nextCursor ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
  const messages = data?.pages
    ? [...data.pages].reverse().flatMap((page) => page.messages)
    : [];

  const type = data ? data?.pages[0].type : null;
  return {
    messages,
    type,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}
