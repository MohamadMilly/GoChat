import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";

const fetchCurrentUserData = async () => {
  const response = await api.get("/users/me/profile");
  return response.data;
};

export function useMe() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUserData,
    staleTime: 1000 * 60 * 5,
  });
  const user = data ? data.user : null;
  const preferences = data ? data.preferences : null;
  return { user, preferences, error, isFetching };
}
