import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const removeAdmin = async ({ conversationId, userId }) => {
  const response = await api.delete(
    `/conversations/${conversationId}/admins/${userId}`,
  );

  return response;
};

export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeAdmin,
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", String(args.conversationId)],
        exact: true,
      });
    },
  });
}
