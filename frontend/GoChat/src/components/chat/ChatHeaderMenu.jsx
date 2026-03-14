import { useContext, useState } from "react";
import Button from "../ui/Button";
import { usePatchUser } from "../../hooks/me/usePatchUser";
import { EllipsisVertical, X } from "lucide-react";

export function ChatHeaderMenu({ isGroup, chatPartner }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: patch, error, isPending } = usePatchUser();

  const handleBlock = (userId) => {
    patch({ blockedUserId: userId });
  };
  return (
    <div className="relative text-gray-600 dark:text-gray-200">
      <Button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <EllipsisVertical size={20} />}
      </Button>
      {isOpen && (
        <div className="absolute text-sm animate-pop w-32 shadow-xs border bg-gray-50 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark: rounded-lg flex flex-col ltr:right-0 rtl:left-0 translate-y-2">
          {!isGroup && (
            <Button onClick={() => handleBlock(chatPartner.id)}>Block</Button>
          )}
        </div>
      )}
    </div>
  );
}
