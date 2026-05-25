import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";

async function removeParticipant({ participantId, conversationId }) {
  const response = await api.delete(
    `/conversations/${conversationId}/participants/${participantId}`,
  );

  return response;
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeParticipant,
    onSettled: (data, err, args, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", String(args.conversationId)],
        exact: true,
      });
    },
  });
}
