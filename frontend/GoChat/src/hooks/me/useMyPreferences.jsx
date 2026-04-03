import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";

const fetchPreferences = async () => {
  const response = await api.get("/users/me/preferences");

  return response.data;
};

export function useMyPrefrences() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
    staleTime: 1000 * 6 * 30,
  });
  const preferences = data ? data.preferences : null;

  return { preferences, isFetching, error };
}
