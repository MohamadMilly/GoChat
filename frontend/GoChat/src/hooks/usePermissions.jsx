import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const fetchPermissions = async (conversationId) => {
  if (!conversationId) return null;
  const response = await api.get(
    `/conversations/${conversationId}/permissions`,
  );

  return response.data;
};

export function usePermissions(conversationId) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["conversation", conversationId, "permissions"],
    queryFn: () => fetchPermissions(conversationId),
    staleTime: 1000 * 60 * 2,
  });
  const permissions = data && !isFetching ? data?.permissions : null;

  return { permissions, error, isFetching };
}
