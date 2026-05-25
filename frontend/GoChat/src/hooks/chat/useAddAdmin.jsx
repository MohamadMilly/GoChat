import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const addAdmin = async ({ conversationId, participantId }) => {
  const response = await api.post(`conversations/${conversationId}/admins`, {
    participantId,
  });

  return response;
};

export function useAddAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAdmin,
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", String(args.conversationId)],
        exact: true,
      });
    },
  });
}
