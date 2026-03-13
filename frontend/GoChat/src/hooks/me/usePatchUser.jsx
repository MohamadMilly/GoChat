import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const patchUser = async (data) => {
  const response = await api.patch("/users/me", data);
  return response.data;
};

export function usePatchUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchUser,
    mutationKey: ["patch user"],
    onMutate: async (data) => {
      const queryKey = ["me"];
      await queryClient.cancelQueries(queryKey);
      const previousMeData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.user) return old;

        return {
          ...old,
          user: {
            ...old.user,
            ...data,
            blockedUsers:
              typeof data.blockedUserId !== "undefined"
                ? [...old.user.blockedUsers, { id: data.blockedUserId }]
                : old.user.blockedUsers,
          },
        };
      });

      return { previousMeData };
    },
    onError: (_err, data, context) => {
      const queryKey = ["me"];
      console.error("Error:", _err);
      queryClient.setQueryData(queryKey, context.previousMeData);
    },
  });
}
