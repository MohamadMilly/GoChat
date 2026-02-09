import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const fetchGroups = async (query) => {
  if (!query) return;
  const response = await api.get("/conversations", {
    params: { title: query },
  });

  return response.data;
};

export function useGroups(query) {
  const { data, error, isFetching } = useQuery({
    queryKey: ["groups", query],
    queryFn: () => fetchGroups(query),
    staleTime: 1000 * 60,
    enabled: !!query,
  });

  const groups = data ? data.conversations : [];

  return { groups, error, isFetching };
}
