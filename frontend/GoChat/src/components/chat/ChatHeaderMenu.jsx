import { useContext, useState } from "react";
import Button from "../ui/Button";
import { usePatchUser } from "../../hooks/me/usePatchUser";
import { EllipsisVertical, X } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { socket } from "../../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "../../hooks/me/useMe";
import { useLeaveConversation } from "../../hooks/useLeaveConversation";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

/* 
TO DO :
When the conversation is a group => if the current user is the owner hide it and move it to the edit  group page 
when the conversation  is a direct one => put it in the ChatHeader 
*/
export function LeaveConversationButton({
  isGroup,
  conversationId,
  isCurrentUserOwner,
  customText = "",
  className = "",
}) {
  const { user } = useAuth();
  const { mutateAsync: leave, isPending, error } = useLeaveConversation();
  const navigate = useNavigate();
  const handleLeaveGroup = async (conversationId) => {
    await leave(conversationId);
    const withDelete = isGroup ? (isCurrentUserOwner ? true : false) : true;
    const fullname = `${user.firstname} ${user.lastname}`;
    socket.emit(
      "leave conversation",
      withDelete,
      fullname,
      user.id,
      conversationId,
    );
    navigate("/chats");
    toast.success("Chat removed successfully.");
  };

  return (
    <Button
      className={className}
      onClick={() => handleLeaveGroup(conversationId)}
    >
      {customText ? customText : isGroup ? "Leave group" : "Delete chat"}
    </Button>
  );
}

export function ChatHeaderMenu({ isGroup, chatPartnerId }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: patch, error, isPending } = usePatchUser();
  const { conversationId, isCurrentUserOwner } = useContext(ChatPageContext);
  const { user, isFetching } = useMe();
  const isChatPartnerBlocked =
    !isFetching &&
    user &&
    user.bannedUsers.some(
      (bannedUserObj) => bannedUserObj.bannedUserId === chatPartnerId,
    );

  const handleBlock = async (userId) => {
    try {
      await patch({ blockedUserId: userId });
      if (isChatPartnerBlocked) {
        socket.emit("unblock user", userId, conversationId);
      } else {
        socket.emit("block user", userId, conversationId);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="relative text-gray-600 dark:text-gray-200">
      <Button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <EllipsisVertical size={20} />}
      </Button>
      {isOpen && (
        <div className="absolute p-0.5 text-sm animate-pop w-32 shadow-xs border bg-gray-50 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark: rounded-lg flex flex-col gap-1 ltr:right-0 rtl:left-0 translate-y-2">
          {!isGroup && (
            <Button onClick={() => handleBlock(chatPartnerId)}>
              {isChatPartnerBlocked ? "UnBlock" : "Block"}
            </Button>
          )}
          {(!isGroup || !isCurrentUserOwner) && (
            <LeaveConversationButton
              isCurrentUserOwner={isCurrentUserOwner}
              conversationId={conversationId}
              isGroup={isGroup}
            />
          )}
        </div>
      )}
    </div>
  );
}
