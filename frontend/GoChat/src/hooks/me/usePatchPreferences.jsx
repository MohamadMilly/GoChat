import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const patchPreferences = async ({ key, value }) => {
  const response = await api.patch("/users/me/preferences", {
    [key]: value,
  });

  return response.data;
};

export function usePatchPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchPreferences,
    mutationKey: ["patchPreferences"],
    onMutate: async (data) => {
      await queryClient.cancelQueries(["preferences"]);

      const previousPreferences = await queryClient.getQueryData([
        "preferences",
      ]);

      queryClient.setQueryData(["preferences"], (old) => {
        return { preferences: { ...old.preferences, [data.key]: data.value } };
      });
      return { previousPreferences };
    },
    onError: (err, args, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(["preferences"], context.previousPreferences);
      }
    },
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries("preferences");
    },
  });
}
