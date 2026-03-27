import { useContext, useState } from "react";
import Button from "../ui/Button";
import { usePatchUser } from "../../hooks/me/usePatchUser";
import { EllipsisVertical, X } from "lucide-react";
import { ChatPageContext } from "../../routes/ChatPage";
import { socket } from "../../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "../../hooks/me/useMe";

export function ChatHeaderMenu({ isGroup, chatPartnerId }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: patch, error, isPending } = usePatchUser();
  const { conversationId } = useContext(ChatPageContext);
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
        <div className="absolute text-sm animate-pop w-32 shadow-xs border bg-gray-50 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark: rounded-lg flex flex-col ltr:right-0 rtl:left-0 translate-y-2">
          {!isGroup && (
            <Button onClick={() => handleBlock(chatPartnerId)}>
              {isChatPartnerBlocked ? "UnBlock" : "Block"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
