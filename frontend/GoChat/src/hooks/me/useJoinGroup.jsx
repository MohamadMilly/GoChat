import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { useNavigate } from "react-router";

const joinGroup = async (conversationId) => {
  const response = await api.post(`/conversations/${conversationId}`);

  return response.data;
};

export function useJoinGroup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: joinGroup,

    mutationKey: ["join group"],
    onSettled: (data, _err, args, context) => {
      queryClient.invalidateQueries(["conversations"]);
    },
    onSuccess: (data, conversationId, context) => {
      navigate(`/chats/group/${conversationId}`);
    },
  });
}
