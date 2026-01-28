import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

async function fetchContacts() {
  const response = await api.get("/users/me/contacts");
  return response.data;
}

export function useMyContacts() {
  const { data, isFetching, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });
  const users = data ? data.users : [];
  return { users, isFetching, error };
}
