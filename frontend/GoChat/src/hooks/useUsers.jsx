import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const fetchUsers = async (query) => {
  const response = await api.get("/users", {
    params: { query },
  });
  return response.data;
};

export function useUsers(query) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["search", "users", query],
    queryFn: () => fetchUsers(query),
    enabled: !!query,
  });
  const users = data ? data.users : [];
  return { users, error, isFetching };
}
