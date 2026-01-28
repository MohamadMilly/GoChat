import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

async function fetchUser(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export function useUser(userId) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });
  const user = data ? data.user : null;
  return { user, isFetching, error };
}
