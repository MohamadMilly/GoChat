import { InputField } from "../ui/InputField";
import { SearchBar } from "../ui/SearchBar";
import { Chats } from "./Chats";

import { NavLink } from "react-router";
import { useConversations } from "../../hooks/useConversations";

import { useEffect } from "react";
import { socket } from "../../socket";
import { useQueryClient } from "@tanstack/react-query";

export function ChatsPanel() {
  const { isFetching, conversations, error } = useConversations();

  const queryClient = useQueryClient();
  useEffect(() => {
    if (isFetching || !conversations) return;
    conversations.forEach((c) => {
      socket.emit("join chat", String(c.id));
    });
  }, [conversations, isFetching]);
  useEffect(() => {
    function onReceiveMessage(message, conversationId) {
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((conversation) => {
            console.log(conversationId, conversation.id);
            if (conversation.id == conversationId) {
              return {
                ...conversation,
                messages: [message],
              };
            }
            return conversation;
          }),
        };
      });
    }
    socket.on("chat message", onReceiveMessage);
    return () => {
      socket.off("chat message", onReceiveMessage);
    };
  }, [queryClient]);
  if (isFetching) return <p className="p-4">Loading</p>;
  if (error) return <p className="p-4">Error: {error}</p>;
  return (
    <aside className="col-start-1 col-end-2 border-r-2 border-cyan-800 bg-white flex flex-col h-full">
      <div className="px-3 pt-3 pb-2">
        <SearchBar />
      </div>
      <div className="px-3 text-sm text-gray-500">{conversations?.length || 0} chats</div>
      <div className="flex-1 overflow-hidden">
        <Chats chatsEntries={conversations} />
      </div>
    </aside>
  );
}
