import { api } from "../../utils/api";
import { useMutation } from "@tanstack/react-query";

const deleteAccount = async () => {
  const response = await api.delete("/users/me");
  return response.data;
};

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    mutationKey: "delete account",
  });
}
