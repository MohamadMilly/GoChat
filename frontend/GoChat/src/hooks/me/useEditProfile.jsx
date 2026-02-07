import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const putProfile = async (data) => {
  const response = await api.put("/users/me/profile", data);
  return response.data;
};

export function useEditProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putProfile,
    mutationKey: ["edit profile"],

    onMutate: async (data) => {
      await queryClient.cancelQueries(["me"]);

      const previousData = queryClient.getQueryData(["me"]);

      queryClient.setQueryData(["me"], (old) => {
        if (!old.user) return old;

        return { ...old, user: { ...old.user, profile: data } };
      });
      return { previousData };
    },
    onError: (_err, args, context) => {
      queryClient.setQueryData(["me"], context.previousData);
    },
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries("preferences");
    },
  });
}
