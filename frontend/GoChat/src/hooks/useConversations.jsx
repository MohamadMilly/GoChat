import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
const fetchConversations = async () => {
  const response = await api.get("/users/me/conversations");
  return response.data;
};

export function useConversations() {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
  const conversations = data ? data.conversations : [];
  return { conversations: conversations, isFetching, error, refetch };
}
