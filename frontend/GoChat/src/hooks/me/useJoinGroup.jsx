import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { useNavigate } from "react-router";
import { socket } from "../../socket";
import { useAuth } from "../../contexts/AuthContext";

const joinGroup = async (conversationId) => {
  const response = await api.post(`/conversations/${conversationId}`);

  return response.data;
};

export function useJoinGroup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  return useMutation({
    mutationFn: joinGroup,
    mutationKey: ["join group"],
    onSettled: (data, _err, args, context) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
        exact: true,
      });
    },
    onSuccess: (data, conversationId, context) => {
      navigate(`/chats/group/${conversationId}`);
      socket.emit(
        "join conversation",
        conversationId,
        `${user.firstname} ${user.lastname}`,
      );
    },
  });
}

/*  TODO :
When i join a  group , i  should emit the event to the server and then the server emits it to all connected users in the conversation to let 
them invalidate the converation data (members) and a notification for the new member
*/
