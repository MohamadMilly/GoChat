import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

const addParticipant = async ({ conversationId, userId }) => {
  const response = await api.post(
    `/conversations/${conversationId}/participants`,
    { userId },
  );
  return response;
};

export function useAddParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addParticipant,
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", String(args.conversationId)],
        exact: true,
      });
    },
  });
}
