import { useEffect } from "react";
import { socket } from "../../socket";
import { api } from "../../utils/api";
import { useQuery } from "@tanstack/react-query";
import { getMessagesOffsets } from "../../utils/getMessagesOffsets";

const fetchConversations = async () => {
  const response = await api.get("/users/me/conversations");
  return response.data;
};

export function useMyConversations() {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 1000 * 60 * 10,
    select: (data) => data ?? [],
    placeholderData: {
      keepPreviousData: true,
    },
  });

  const conversations = data ? data.conversations : [];

  useEffect(() => {
    if (isFetching || data.conversations.length === 0) return;
    const offsets = {};
    const previousOffsets = getMessagesOffsets() || {};
    data.conversations.forEach((c) => {
      const offset =
        c.messages[c.messages.length - 1]?.id ||
        previousOffsets[c.id.toString()] ||
        0;

      offsets[c.id.toString()] = offset;

      socket.auth.isInitialDataLoading = false;
      const roomId = `${c.id}`;
      socket.emit("join conversation", roomId);
    });
    socket.auth.serverOffset = offsets;
    localStorage.setItem("offsets", JSON.stringify(offsets));
  }, [isFetching, data.conversations]);

  return { conversations: conversations, isFetching, error, refetch };
}
