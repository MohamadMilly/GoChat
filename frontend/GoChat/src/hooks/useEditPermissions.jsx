import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

const editPermssions = async ({ conversationId, data }) => {
  const response = await api.put(
    `/conversations/${conversationId}/permissions`,
    data,
  );
  return response.data;
};

export function useEditPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editPermssions,
    mutationKey: ["put permissions"],

    onMutate: async ({ conversationId, data }) => {
      const queryKey = ["conversation", conversationId, "permissions"];
      await queryClient.cancelQueries(queryKey);

      const previousPermissions = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old.permissions) return old;
        return {
          ...old,
          permissions: {
            ...old.permissions,
            ...data,
          },
        };
      });

      return { previousPermissions };
    },

    onError: (_err, args, context) => {
      const queryKey = ["conversation", "permissions", args.conversationId];
      queryClient.setQueryData(queryKey, context.previousPermissions);
    },
  });
}
